import * as dotenv from 'dotenv';

dotenv.config();

export default () => {
  return {
    app: {
      nodeEnv: process.env.ENV ?? 'dev',
      service_name: process.env.SERVICE || 'TUP_ME',
    },
    database: {
      type: 'postgres',
      database: process.env.DATABASE_NAME,
      host: process.env.DATABASE_HOST,
      port: 5432,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
    },
    authentication: {
      bcrypt_salt: Number(process.env.BCRYPT_SALT),
      jwt_secret: process.env.JWT_SECRET,
    },
    google: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      oauth_URL: process.env.GOOGLE_OAUTH_URL,
    },
    logging: {
      tg_token: process.env.TELEGRAM_TOKEN,
      tg_channel: process.env.TELEGRAM_CHANNEL,
    },
  };
};
