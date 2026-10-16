// Runs before any app module is imported: jwt.ts and requireCronSecret.ts read env at load time.
// dotenv never overrides already-set vars, so app.ts's dotenv.config cannot replace these.
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_ISSUER = 'test-issuer';
process.env.JWT_AUDIENCE = 'test-audience';
process.env.CRON_SECRET = 'test-cron-secret';
process.env.MONGO_URI = 'mongodb://127.0.0.1:1/lyra-test-never-connected';
process.env.RESEND_API_KEY = 're_test_not_a_real_key';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.CORS_ORIGINS = 'http://localhost:3000';
delete process.env.DEV_AUTH_BYPASS;
delete process.env.ENABLE_DB_BACKUP;
