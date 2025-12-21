import fetch from 'node-fetch';

async function sendSms(to: string, message: string) {
  try {
    const username = process.env.AT_USERNAME;
    const apiKey = process.env.AT_API_KEY;
    if (!username || !apiKey) {
      console.log('AT credentials missing, falling back to log');
      console.log('Send SMS to', to, message);
      return { ok: true, debug: true };
    }
    const url = `https://api.africastalking.com/version1/messaging`;
    const body = new URLSearchParams();
    body.append('username', username);
    body.append('to', to);
    body.append('message', message);
    const res = await fetch(url, { method: 'POST', headers: { 'apikey': apiKey, 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
    const json = await res.json();
    return { ok: true, resp: json };
  } catch (err) {
    console.error('Failed to send SMS via AfricaTalking', err);
    throw err;
  }
}

export default { sendSms };
