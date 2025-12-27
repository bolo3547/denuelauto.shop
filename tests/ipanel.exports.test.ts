import path from 'path'

describe('iPanel-compatible exports', () => {
  test('root `dist/index.js` exports startServer and app and can start/close', async () => {
    const distIndex = path.resolve(__dirname, '../dist/index.js')
    // require compiled module (should NOT auto-start)
    const mod = require(distIndex)
    expect(typeof mod.startServer).toBe('function')
    expect(typeof mod.default).toBe('function')

    // actually start on an ephemeral port and close immediately
    const server = await mod.startServer(0)
    expect(typeof server.close).toBe('function')
    await new Promise<void>((res) => server.close(() => res()))
  })

  test('`New folder` compiled min-server exports startServer and app and can start/close', async () => {
    const minServerPath = path.resolve(__dirname, '../New folder/dist/src/min-server.js')
    const mod = require(minServerPath)
    expect(typeof mod.startServer).toBe('function')
    expect(typeof mod.default).toBe('function')

    const server = await mod.startServer(0)
    expect(typeof server.close).toBe('function')
    await new Promise<void>((res) => server.close(() => res()))
  })
})
