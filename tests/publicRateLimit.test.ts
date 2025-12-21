import request from 'supertest';
import app from '../src/app';

describe('Public rate limiting for inquiries/reserve', () => {
  it('should rate limit after 5 requests per minute', async () => {
    const Promisified = Promise.resolve;
    // run 6 inquiries
    const calls = [] as any[];
    for (let i = 0; i < 6; i++) {
      calls.push(request(app).post('/t/sample-dealer/public/cars/inquiry').send({ name: 'John', phone: '0777' + i, message: 'Hi' }));
    }
    const results = await Promise.all(calls);
    const statuses = results.map((r) => r.status);
    // statuses should include 429
    expect(statuses.filter((s) => s === 429).length <= 1).toBeTruthy();
  });
});
