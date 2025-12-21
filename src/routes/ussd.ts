import express from 'express';
import { PrismaClient } from '@prisma/client';
import ussdService from '../services/ussd.service';
import { buildMenu, endMessage, parseTouchInput } from '../utils/ussd';
import { ussdRateLimiter } from '../middleware/rateLimit';
import mtnClient from '../services/mtn.client';
import airtelClient from '../services/airtel.client';

const router = express.Router();
const prisma = new PrismaClient();

// minimal header middleware for tenant via channel mapping - could be extended
router.use((req, res, next) => {
  const tenantId = req.headers['x-tenant-id'] || req.body?.tenantId || null;
  (req as any).tenantId = tenantId;
  next();
});

router.post('/', ussdRateLimiter, async (req, res) => {
  const { sessionId, phoneNumber, text, serviceCode } = req.body;
  const msisdn = phoneNumber || req.body.msisdn;
  // Tenant selection: explicit header or channel parsing from serviceCode or text prefix
  let tenantId = (req as any).tenantId || null;
  if (!tenantId && serviceCode) {
    // serviceCode might include tenant alias
    tenantId = await ussdService.tenantFromChannel(serviceCode) || tenantId;
  }
  if (!tenantId && text) {
    tenantId = await ussdService.tenantFromChannel(text) || tenantId;
  }
  if (!sessionId || !msisdn) return res.status(400).send('Missing sessionId or phoneNumber');
  // get session
  const session = await ussdService.getSession(sessionId) || { step: 'welcome', msisdn, tenantId, lastSeenAt: new Date().toISOString(), lang: 'EN' };
  // log event
  await ussdService.recordUssdAudit(session.tenantId, msisdn, 'ussd.call', { text, serviceCode, sessionId });
  const input = parseTouchInput(text);
  // normalize input
  const normalizedInput = (input || '').trim();
  // Global shortcuts
  if (normalizedInput === '0') return res.send('END Goodbye');
  if (normalizedInput === '00') {
    session.step = 'welcome';
    await ussdService.saveSession(sessionId, session);
    return res.send(await ussdService.buildWelcome(tenantId || ''));
  }
  if (normalizedInput === '9') {
    // go back to previous/ home
    session.step = 'welcome';
    await ussdService.saveSession(sessionId, session);
    return res.send(await ussdService.buildWelcome(tenantId || ''));
  }
  if (normalizedInput === '*') {
    session.lang = session.lang === 'EN' ? 'BM' : (session.lang === 'BM' ? 'NY' : 'EN');
    await ussdService.saveSession(sessionId, session);
    return res.send('CON Language changed');
  }
  // timeout resume handling
  // timeout resume: if lastSeenAt > 100s, ask to resume
  if (session.lastSeenAt) {
    const last = new Date(session.lastSeenAt).getTime();
    if (Date.now() - last > 100000 && !input) {
      session.step = 'resume_prompt';
      await ussdService.saveSession(sessionId, session);
      return res.send('CON Continue last step? 1) Yes 2) No');
    }
  }
  const now = Date.now();
  // handle menu navigation
  if (session.step === 'welcome') {
    if (!input) {
      const payload = await ussdService.buildWelcome(tenantId || '');
      session.step = 'welcome';
      await ussdService.saveSession(sessionId, session);
      return res.send(payload);
    }
    if (input === '1') {
      // Type of cars
      const payload = await ussdService.browseQuickList(tenantId || '');
      session.step = 'browse_quick';
      await ussdService.saveSession(sessionId, session);
      await ussdService.recordUssdAudit(session.tenantId, msisdn, 'ussd.browse', { page: 1 });
      return res.send(payload);
    }
    if (input === '2') {
      // Payment guide menu
      session.step = 'payment_options';
      await ussdService.saveSession(sessionId, session);
      return res.send('CON Payment guide\n1) Airtel Money\n2) MTN MoMo\n3) Bank\n9) Back 00) Home');
    }
      if (session.step === 'payment_options') {
        if (input === '1') {
          session.provider = 'airtel';
          session.step = 'welcome';
          await ussdService.saveSession(sessionId, session);
          return res.send('CON Airtel Money selected. Proceed to car selection.');
        }
        if (input === '2') {
          session.provider = 'mtn';
          session.step = 'welcome';
          await ussdService.saveSession(sessionId, session);
          return res.send('CON MTN MoMo selected. Proceed to car selection.');
        }
        if (input === '3') {
          session.provider = 'bank';
          session.step = 'welcome';
          await ussdService.saveSession(sessionId, session);
          return res.send('CON Bank transfer selected. Proceed to car selection.');
        }
        if (input === '9' || input === '00') {
          session.step = 'welcome';
          await ussdService.saveSession(sessionId, session);
          return res.send(await ussdService.buildWelcome(tenantId || ''));
        }
        return res.send('CON Invalid payment option. 9) Back 00) Home');
      }
    if (input === '3') {
      session.step = 'check_order';
      await ussdService.saveSession(sessionId, session);
      return res.send('CON Enter Order Ref (e.g., BF-12345):');
    }
    if (input === '4') {
      // Next page: more options
      return res.send('CON More options\n5) Promotions today\n6) Finance / Pay in parts\n7) Duty & CIF\n8) Track shipment\n9) Nearest branch\n00) Home');
    }
    // add more branches
    return res.send('CON Invalid option. 00) Home');
  }

  if (session.step === 'browse_quick') {
    if (!input) return res.send(await ussdService.browseQuickList(tenantId || ''));
    // input could be selection 1/2/3 or code
    if (input.match(/^[A-Za-z]\d+/) || input.match(/^D\d+/i)) {
      // treat as short code
      const code = input.toUpperCase();
      const car = await ussdService.findCarByShortCode(tenantId || '', code);
      if (!car) return res.send('CON Car not found. 9) Back 00) Home');
      session.step = 'car_view';
      session.car = { id: car.id, stockNo: car.stockNo, shortCode: car.shortCode };
      await ussdService.saveSession(sessionId, session);
      await ussdService.recordUssdAudit(session.tenantId, msisdn, 'ussd.car.view', { stockNo: car.stockNo });
      const msg = `CON ${car.shortCode} ${car.make} ${car.model} ${car.year}\nZMW ${car.priceLocalZmw}\n1) Reserve & pay deposit\n2) See similar\n9) Back 00) Home`;
      return res.send(msg);
    }
    if (input === '9') {
      session.step = 'welcome';
      await ussdService.saveSession(sessionId, session);
      return res.send(await ussdService.buildWelcome(tenantId || ''));
    }
    return res.send('CON Invalid input. 9) Back 00) Home');
  }

  if (session.step === 'car_view') {
    if (input === '1') {
      // calculate deposit - 10% or min
      const cartCar = await prisma.car.findUnique({ where: { id: session.car.id } });
      const amount = Math.max(Number(cartCar?.priceLocalZmw ?? 0) * 0.1, 500);
      session.step = 'confirm_deposit';
      session.deposit = amount;
      await ussdService.saveSession(sessionId, session);
      return res.send(`CON Deposit ZMW ${amount} to reserve?\n1) Yes 2) No 9) Back 00) Home`);
    }
    if (input === '2') {
      // show similar - placeholder
      return res.send('CON Similar cars coming soon. 9) Back 00) Home');
    }
  }

  if (session.step === 'confirm_deposit') {
    if (input === '1') {
      // place hold
      const result = await ussdService.holdCar(session.tenantId || tenantId, msisdn, session.car.stockNo);
      if (!result.ok) return res.send('END Sorry, car is not available.');
      // initiate collection via selected provider
      const amount = session.deposit;
      let requestId, mp;
      if (session.provider === 'airtel') {
        const result = await airtelClient.createAirtelCollection({ msisdn, amount, currency: 'ZMW' });
        requestId = result.requestId;
        mp = await prisma.mobilePayment.create({ data: { tenantId: session.tenantId || tenantId, msisdn, provider: 'airtel', amount, currency: 'ZMW', requestId, status: 'pending' } as any });
      } else {
        const result = await mtnClient.createMtnCollection({ msisdn, amount, currency: 'ZMW' });
        requestId = result.requestId;
        mp = await prisma.mobilePayment.create({ data: { tenantId: session.tenantId || tenantId, msisdn, provider: 'mtn', amount, currency: 'ZMW', requestId, status: 'pending' } as any });
      }
      session.step = 'collect_wait';
      session.payment = { requestId, id: mp.id };
      await ussdService.saveSession(sessionId, session);
      await ussdService.recordUssdAudit(session.tenantId, msisdn, 'ussd.collect.initiated', { requestId, amount });
      return res.send('CON Payment prompt sent. Enter your MoMo/Airtel PIN to confirm.\n1) I approved 2) Retry 00) Home');
    }
    if (input === '2') {
      session.step = 'car_view';
      await ussdService.saveSession(sessionId, session);
      return res.send('CON Back to car view');
    }
  }

  if (session.step === 'collect_wait') {
    if (input === '1') {
      return res.send('CON Waiting for confirmation.\n00) Home');
    }
    if (input === '2') {
      // retry flow
      return res.send('CON We retried the payment prompt');
    }
  }

  // default: send home menu
  session.step = 'welcome';
  await ussdService.saveSession(sessionId, session);
  return res.send(await ussdService.buildWelcome(tenantId || ''));
});

export default router;
