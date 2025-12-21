import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { globalRateLimiter } from './middleware/rateLimit';
import { PrismaClient } from '@prisma/client';
import { securityHeaders } from './middleware/securityHeaders';
// RBAC support in per-route middleware
import { tenantIsolation } from './middleware/tenantIsolation';
import { hostTenantResolver } from './middleware/hostTenant';
import { auditLogger } from './middleware/auditLogger';
import carsRouter from './routes/cars';
import tenantsRouter from './routes/tenants';
import authRouter from './routes/auth';
import publicCarsRouter from './routes/publicCars';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import printRouter from './routes/print';
import leadsRouter from './routes/leads';
import quotesRouter from './routes/quotes';
import proformasRouter from './routes/proformas';
import salesRouter from './routes/sales';
import paymentsRouter from './routes/payments';
import agentsRouter from './routes/agents';
import tradeInsRouter from './routes/tradeIns';
import affiliatesRouter from './routes/affiliates';
import attributionRouter from './routes/attribution';
import holdsRouter from './routes/holds';
import escrowRouter from './routes/escrow';
import reviewsRouter from './routes/reviews';
import agentDealsRouter from './routes/agentDeals';
import buyersRouter from './routes/buyers';
import exportRouter from './routes/export';
import shipmentsRouter from './routes/shipments';
import analyticsRouter from './routes/analytics';
import testDrivesRouter from './routes/testDrives';
import pushRouter from './routes/push';
import shippingTimelineRouter from './routes/shippingTimeline';
import fxSettingsRouter from './routes/fxSettings';
import paymentProvidersRouter from './routes/paymentProviders';
import paymentsGatewayRouter from './routes/payments.gateway';
import paymentProofsRouter from './routes/paymentProofs';
import ussdRouter from './routes/ussd';
import hqAuthRouter from './routes/hq/auth';
import hqTenantsRouter from './routes/hq/tenants';
import hqHealthRouter from './routes/hq/health';
import hqAdminProxyRouter from './routes/hq/adminProxy';
import uploadsRouter from './routes/uploads';
import { hqSupportRouter, hqSupportPublicRouter } from './routes/hq/supportSettings';
import ussdAuth from './middleware/ussdAuth';
import ussdCleanupRouter from './routes/ussd.cleanup';
import ussdBrowseRouter from './routes/ussd.browse';
import ussdHoldRouter from './routes/ussd.hold';
import momoRouter from './routes/momo';
import airtelRouter from './routes/airtel';
import receiptsRouter from './routes/receipts';
import ordersRouter from './routes/orders';
import healthRouter from './routes/health';
import openchatRouter from './routes/openchat';
import agentAuthRouter from './routes/agentAuth';
import agentPortalRouter from './routes/agentPortal';
import superTenantsRouter from './routes/superTenants';
import billingRouter from './routes/billing';
import domainsRouter from './routes/domains';
import ussdChannelsAdminRouter from './routes/admin/ussdChannels';
import merchantsAdminRouter from './routes/admin/merchants';

const app = express();
const openapiDocument = YAML.load('./openapi.yaml');
const prisma = new PrismaClient();

// CORS configuration for split deployment (frontend on different domain)
const defaultCorsOrigins = ['http://localhost:3000', 'http://localhost:3001'];
const corsOrigins = process.env.CORS_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean) || defaultCorsOrigins;
const corsOptions: cors.CorsOptions = {
	origin: corsOrigins.length > 0 ? corsOrigins : true,
	credentials: process.env.CORS_CREDENTIALS ? process.env.CORS_CREDENTIALS === 'true' : true,
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Slug', 'Cache-Control', 'Cookie'],
};

app.use(express.json({ verify: (req: any, res, buf, encoding) => {
	const enc = encoding as BufferEncoding | undefined;
	try { req.rawBody = buf.toString(enc ?? 'utf8'); } catch (e) { req.rawBody = undefined; }
}}));
// also parse urlencoded bodies for USSD providers sending x-www-form-urlencoded payloads
app.use(express.urlencoded({ extended: false, verify: (req: any, res, buf, encoding) => {
	const enc = encoding as BufferEncoding | undefined;
	try { req.rawBody = buf.toString(enc ?? 'utf8'); } catch (e) { req.rawBody = undefined; }
}}));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(helmet());
app.use(securityHeaders);
app.use(globalRateLimiter);
app.use(auditLogger);
// host based tenant resolver (custom domains)
app.use(hostTenantResolver);

// serve uploads folder when running locally (non-s3)
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

app.use('/api/tenants', tenantsRouter);
app.use('/api/auth', authRouter);
app.use('/api/cars', tenantIsolation, carsRouter);
app.use('/', publicCarsRouter);
app.use('/', printRouter);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));
app.use('/api/leads', tenantIsolation, leadsRouter);
app.use('/api/quotes', tenantIsolation, quotesRouter);
app.use('/api/proformas', tenantIsolation, proformasRouter);
app.use('/api/payments', tenantIsolation, paymentsRouter);
app.use('/api/admin/sales', tenantIsolation, salesRouter);
app.use('/api/agents', tenantIsolation, agentsRouter);
app.use('/api/buyers', tenantIsolation, buyersRouter);
app.use('/buyer', tenantIsolation, buyersRouter); // convenience mapping for frontend using /buyer
app.use('/api/export', tenantIsolation, exportRouter);
app.use('/api/shipments', tenantIsolation, shipmentsRouter);
app.use('/api/agent-deals', tenantIsolation, agentDealsRouter);
app.use('/api/ussd', ussdRouter);
// External USSD callbacks for specific service codes
app.post('/ussd/retail', ussdAuth, (req: any, res, next) => { req.body.serviceCode = '*384*26056#'; next(); }, ussdRouter);
app.post('/ussd/rental', ussdAuth, (req: any, res, next) => { req.body.serviceCode = '*384*53920#'; next(); }, ussdRouter);
app.use('/api', momoRouter);
app.use('/api', airtelRouter);
app.use('/api', receiptsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api', ussdCleanupRouter);
app.use('/api', ussdBrowseRouter);
app.use('/api', ussdHoldRouter);
app.use('/api', healthRouter);
app.use('/api/openchat', tenantIsolation, openchatRouter);
app.use('/api/trade-ins', tenantIsolation, tradeInsRouter);
app.use('/t/:slug/public', attributionRouter); // attribution public endpoint
app.use('/api/admin', tenantIsolation, affiliatesRouter);
app.use('/api/admin/billing', tenantIsolation, billingRouter);
app.use('/billing', billingRouter); // public webhook endpoints: /billing/webhooks/:provider
app.use('/api/admin', tenantIsolation, domainsRouter);
app.use('/api/admin', tenantIsolation, ussdChannelsAdminRouter);
app.use('/api/admin', tenantIsolation, merchantsAdminRouter);
app.use('/super', superTenantsRouter);
app.use('/buyer', tenantIsolation, holdsRouter);
app.use('/buyer', tenantIsolation, escrowRouter);
app.use('/', reviewsRouter);
app.use('/api/analytics', tenantIsolation, analyticsRouter);
app.use('/api/push', tenantIsolation, pushRouter);
app.use('/api/test-drives', tenantIsolation, testDrivesRouter);
// HQ admin routes (separate from tenant admin paths)
app.use('/api/hq', hqAuthRouter);
app.use('/api/hq/tenants', hqTenantsRouter);
app.use('/api/hq', hqHealthRouter);
app.use('/api/hq', hqSupportRouter);
app.use('/api/hq/public', hqSupportPublicRouter);
app.use('/api/hq', hqAdminProxyRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api', tenantIsolation, shippingTimelineRouter);
app.use('/api', tenantIsolation, fxSettingsRouter);
app.use('/api', tenantIsolation, paymentProvidersRouter);
app.use('/api', tenantIsolation, paymentsGatewayRouter);
app.use('/api/payment-proofs', paymentProofsRouter);
// Agent portal under tenant slug
import { tenantResolver } from './middleware/tenant';
import subscriptionRouter from './routes/subscription.routes';
import aiRouter from './routes/ai.routes';
app.use('/t/:slug/agent', tenantResolver, agentAuthRouter);
app.use('/t/:slug/agent', tenantResolver, agentPortalRouter);
// Subscription & AI routes
app.use('/api/subscription', tenantIsolation, subscriptionRouter);
app.use('/api/ai', tenantIsolation, aiRouter);

// =====================================================
// NATIONAL AUTOMOTIVE INFRASTRUCTURE ROUTES
// Strategic expansion: Network, Market Intelligence, Financing
// =====================================================
import networkRouter from './routes/network.routes';
import buyerGlobalRouter from './routes/buyer.routes';
import marketRouter from './routes/market.routes';
import financingRouter from './routes/financing.routes';
import verificationRouter from './routes/verification.routes';
import marketingRouter from './routes/marketing.routes';

// Priority 1: National Dealer Network (Public marketplace)
app.use('/api/network', networkRouter);
// Global Buyer Accounts (Cross-dealer buyer system)
app.use('/api/buyer', buyerGlobalRouter);
// Priority 2: Market Intelligence & AI Pricing
app.use('/api/market', marketRouter);
// Priority 3: Financing Partner Integration
app.use('/api/financing', financingRouter);
// Dealer Verification (Trust badges)
app.use('/api/verification', verificationRouter);
// Marketing Automation
app.use('/api/marketing', tenantIsolation, marketingRouter);

app.get('/', (req: Request, res: Response) => res.send('Car Dealership API - National Automotive Infrastructure'));

// Health endpoint for load balancers and monitoring
app.get('/health', async (req: Request, res: Response) => {
	try {
		await prisma.$queryRaw`SELECT 1`;
		res.json({ ok: true, uptime: process.uptime() });
	} catch (err) {
		res.status(503).json({ ok: false, error: 'database_unavailable' });
	}
});

export default app;
