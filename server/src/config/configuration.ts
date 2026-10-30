export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/nexa',
  jwt: {
    secret: process.env.JWT_SECRET ?? 'nexa-super-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI ?? 'http://localhost:3000/auth/google/callback',
  },
  whatsapp: {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? '',
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? 'nexa-webhook-verify',
    webhookSecret: process.env.WHATSAPP_WEBHOOK_SECRET ?? '',
  },
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY ?? '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
    geminiApiKey: process.env.GEMINI_API_KEY ?? '',
    defaultModel: process.env.AI_DEFAULT_MODEL ?? 'gemini-1.5-flash',
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY ?? 'nexa-encryption-key-32-chars-long',
  },
  appUrl: process.env.APP_URL ?? 'http://localhost:3000',
});
