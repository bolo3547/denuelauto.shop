import { prisma } from './prismaClient'
import app from './app'

const DEFAULT_PORT = process.env.PORT || 4000

export async function startServer(port: number | string = DEFAULT_PORT) {
  const server = app.listen(port, async () => {
    console.log(`Server listening on ${port}`)
    try { await prisma.$connect(); console.log('Prisma connected') } catch (e) { console.error(e) }
  })
  return server
}

// Start server when run directly (node dist/index.js)
// eslint-disable-next-line @typescript-eslint/no-var-requires
if (typeof require !== 'undefined' && require.main === module) {
  startServer()
}

export default app

