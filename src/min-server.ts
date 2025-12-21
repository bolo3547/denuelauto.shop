import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import buyerCheckoutRouter from './routes/buyer.checkout';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/buyer', buyerCheckoutRouter);

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`Min server listening on ${port}`);
});

// Keep the process alive
server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Prevent process from exiting
process.stdin.resume();
