# iPanel deployment note

✅ Goal: make the project compatible with iPanel by exporting an Express `app` and a `startServer` function without starting the server automatically when the module is imported.

What changed
- `src/app.ts` — builds and exports the configured Express `app` (no listen)
- `src/index.ts` — exports `startServer(port?)` and `default` app. When run directly (`node dist/index.js`) it starts the server automatically.
- `New folder/src/min-server.ts` (and backup) — now export `default` app and `startServer`; only auto-starts when run directly.

How to use from iPanel
- If iPanel expects an Express app:

  const app = require('./min-server.js').default
  // iPanel can now mount or manage `app`

- If iPanel wants to start/stop the server itself:

  const { startServer } = require('./min-server.js')
  const server = startServer(4000)
  // server is an http.Server and can be closed with server.close()

Notes
- Requiring the module no longer starts the server, so importing it inside other tooling (or iPanel) will not cause `server.listen is not a function` runtime errors.
- For local development, `npm run dev` still starts the server (via `src/index.ts` and `ts-node-dev`).

If you want, I can also:
- add an automated test that ensures requiring the compiled module doesn't start a server
- update CI/build steps to compile the `New folder` tsconfig target so `min-server.js` is always produced in CI
