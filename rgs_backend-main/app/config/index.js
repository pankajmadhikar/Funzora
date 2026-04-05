const config = {
  mongo: {
    username: process.env.MONGO_USERNAME || null,
    password: process.env.MONGO_PASSWORD || null,
    // host: process.env.MONGO_HOST || null,
    // db: process.env.MONGO_DB || null,
  },
  jwt: {
    secret: process.env.JWT_SECRET || null,
  },
};

module.exports = config;
