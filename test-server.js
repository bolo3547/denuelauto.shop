const express = require('express');
const app = express();

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

const server = app.listen(4000, '0.0.0.0', () => {
  console.log('Server listening on http://0.0.0.0:4000');
});

// Keep the process alive
process.stdin.resume();
process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.close();
  process.exit(0);
});

console.log('Process started, PID:', process.pid);
