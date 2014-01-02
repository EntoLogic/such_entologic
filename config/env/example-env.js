module.exports = {
  db: "mongodb://localhost/entologic_dev",
  sessionsSecret: "wowsoentologic",
  disableXsrfProtection: true, 
  redis: {
    host: "localhost",
    port: 6379,
    dbNumber: 5
    // password: "foobarwow"
  },
  app: {
    name: "EntoLogic - Environment"
  },
  twitter: {
    clientID: "CONSUMER_KEY",
    clientSecret: "CONSUMER_SECRET",
    callbackURL: "http://localhost:3000/auth/twitter/callback"
  },
  github: {
    clientID: "APP_ID",
    clientSecret: "APP_SECRET",
    callbackURL: "http://localhost:3000/auth/github/callback"
  },
  google: {
    clientID: "APP_ID",
    clientSecret: "APP_SECRET",
    callbackURL: "http://localhost:3000/auth/google/callback"
  }
}