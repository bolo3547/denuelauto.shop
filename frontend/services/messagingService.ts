// Messaging service for WhatsApp/SMS follow-ups using Twilio

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function sendSMS(phone: string, message: string): Promise<boolean> {
  if (!client || !twilioPhone) {
    console.log(`Mock SMS to ${phone}: ${message}`);
    return true;
  }
  try {
    await client.messages.create({
      body: message,
      from: twilioPhone,
      to: phone,
    });
    return true;
  } catch (e) {
    console.error('SMS send failed', e);
    return false;
  }
}

export async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  if (!client || !twilioPhone) {
    console.log(`Mock WhatsApp to ${phone}: ${message}`);
    return true;
  }
  try {
    await client.messages.create({
      body: message,
      from: `whatsapp:${twilioPhone}`,
      to: `whatsapp:${phone}`,
    });
    return true;
  } catch (e) {
    console.error('WhatsApp send failed', e);
    return false;
  }
}

export async function sendFollowUp({ to, message }: { to: string; message: string }): Promise<boolean> {
  // Minimal implementation: use WhatsApp for numbers that look international, otherwise fallback to SMS
  try {
    if (to && to.startsWith('+')) {
      return await sendWhatsApp(to, message);
    }
    return await sendSMS(to, message);
  } catch (e) {
    console.error('sendFollowUp failed', e);
    return false;
  }
}
