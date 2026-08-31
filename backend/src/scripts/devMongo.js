/**
 * Dev-only in-memory MongoDB on :27017 — for sandboxes/CI machines without a
 * local mongod. On machines with normal internet access this downloads the
 * official MongoDB binary once (cached by mongodb-memory-server).
 *
 *   npm run dev:db
 *
 * NOTE: data lives in a temp dir and RESETS when this process stops. For
 * real development use a local MongoDB or free Atlas M0 (docs/FREE_TIER_PLAN.md).
 */
const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  const mongod = await MongoMemoryServer.create({
    instance: { port: 27017, ip: '127.0.0.1' },
  });
  console.log(
    `[dev-mongo] in-memory MongoDB listening at ${mongod.getUri()} (data resets on stop)`
  );
  const stop = async () => {
    console.log('[dev-mongo] stopping…');
    await mongod.stop();
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
})().catch((err) => {
  console.error('[dev-mongo] failed to start:', err.message);
  process.exit(1);
});
