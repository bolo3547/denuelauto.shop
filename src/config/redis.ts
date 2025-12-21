import { createClient, RedisClientType } from 'redis';

type RedisLike = Pick<RedisClientType, 'get' | 'set' | 'setEx' | 'del' | 'ping'>;

function createMemoryClient(): RedisLike {
  type Entry = { value: string; expiresAt?: number };
  const store = new Map<string, Entry>();

  const purgeExpired = (key: string) => {
    const entry = store.get(key);
    if (!entry) return;
    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      store.delete(key);
    }
  };

  return {
    async get(key: string) {
      purgeExpired(key);
      const entry = store.get(key);
      return entry ? entry.value : null;
    },
    async set(key: string, value: string) {
      store.set(key, { value });
      return 'OK';
    },
    async setEx(key: string, ttlSeconds: number, value: string) {
      const expiresAt = Date.now() + ttlSeconds * 1000;
      store.set(key, { value, expiresAt });
      return 'OK';
    },
    async del(key: string) {
      const existed = store.delete(key);
      return existed ? 1 : 0;
    },
    async ping() {
      return 'PONG';
    },
  };
}

const memoryClient = createMemoryClient();
const redisUrl = process.env.REDIS_URL;
let connectedClient: RedisClientType | null = null;

if (redisUrl) {
  const client = createClient({ url: redisUrl });
  let disabled = false;

  const disableRedis = (reason: string, err?: unknown) => {
    if (disabled) return;
    disabled = true;
    connectedClient = null;
    if (err) {
      console.warn(`Redis disabled: ${reason}`, err);
    } else {
      console.warn(`Redis disabled: ${reason}`);
    }
    client.removeAllListeners();
    client.quit().catch(() => null);
  };

  client.on('error', (err: any) => {
    const message = err?.message ?? '';
    if (typeof message === 'string' && message.toUpperCase().includes('WRONGPASS')) {
      disableRedis('authentication failed; falling back to in-memory cache', err);
      return;
    }
    if (!disabled) {
      console.error('Redis Client Error', err);
    }
  });

  client.on('end', () => {
    if (!disabled) {
      console.warn('Redis connection closed. Falling back to in-memory cache.');
      connectedClient = null;
    }
  });

  client.connect().then(() => {
    if (!disabled) {
      connectedClient = client;
      console.log('Redis connected');
    }
  }).catch((err: unknown) => {
    disableRedis('connection failed', err);
  });
}

const redisClient: RedisLike = {
  async get(key: string) {
    if (connectedClient) {
      try { return await connectedClient.get(key); } catch (err) { console.error('Redis get failed; using fallback', err); }
    }
    return memoryClient.get(key);
  },
  async set(key: string, value: string) {
    if (connectedClient) {
      try { return await connectedClient.set(key, value); } catch (err) { console.error('Redis set failed; using fallback', err); }
    }
    return memoryClient.set(key, value);
  },
  async setEx(key: string, ttlSeconds: number, value: string) {
    if (connectedClient) {
      try { return await connectedClient.setEx(key, ttlSeconds, value); } catch (err) { console.error('Redis setEx failed; using fallback', err); }
    }
    return memoryClient.setEx(key, ttlSeconds, value);
  },
  async del(key: string) {
    if (connectedClient) {
      try { return await connectedClient.del(key); } catch (err) { console.error('Redis del failed; using fallback', err); }
    }
    return memoryClient.del(key);
  },
  async ping() {
    if (connectedClient) {
      try { return await connectedClient.ping(); } catch (err) { console.error('Redis ping failed; using fallback', err); }
    }
    return memoryClient.ping();
  },
};

export default redisClient;