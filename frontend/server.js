/**
 * Custom Next.js Server for cPanel Node.js Hosting
 * 
 * This server binds to process.env.PORT (required by cPanel/Passenger)
 * and serves the Next.js application in production mode.
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = false; // Always production on hosting
const hostname = '0.0.0.0'; // Bind to all interfaces
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Node.js version: ${process.version}`);
    console.log(`> Environment: ${process.env.NODE_ENV || 'production'}`);
  });
});
