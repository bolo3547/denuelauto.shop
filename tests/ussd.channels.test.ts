import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('USSD channel endpoints', () => {
  let defaultTaskId: string;
  beforeAll(async () => {
    await prisma.$connect();
    defaultTaskId = process.env.USSD_API_TASK_ID || '';
    if (!defaultTaskId) process.env.USSD_API_TASK_ID = 'atsk_test';
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('accepts /ussd/retail and returns Welcome', async () => {
    const res = await request(app)
      .post('/ussd/retail')
      .set('x-api-task-id', process.env.USSD_API_TASK_ID || '')
      .send({ sessionId: 'sess-1', phoneNumber: '+260971234567', text: '' });
    expect(res.status).toBe(200);
    expect(res.text.startsWith('CON Welcome to Denuel')).toBeTruthy();
  });
  it('accepts /ussd/rental and returns Welcome', async () => {
    const res = await request(app)
      .post('/ussd/rental')
      .set('x-api-task-id', process.env.USSD_API_TASK_ID || '')
      .send({ sessionId: 'sess-2', phoneNumber: '+260971234568', text: '' });
    expect(res.status).toBe(200);
    expect(res.text.startsWith('CON Welcome to Denuel')).toBeTruthy();
  });
});
