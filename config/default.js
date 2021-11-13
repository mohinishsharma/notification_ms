module.exports = {
  mode: 'development',
  cors: '*', // this can be multiple origins
  trigger: 'redis', // possible value 'api', 'redis'
  express: {
    port: process.env.PORT || 5000
  },
  mongoDB: {
    username: '',
    password: '',
    host: 'localhost',
    port: 27017,
    database: 'notification_ms'
  },
  redis: {
    host: 'localhost',
    username: '',
    password: '',
    database: '',
    port: 6379
  },
  firebase: {
    sdk: 'something'
  },
  msg91Key: 'apiKey',
  mailgun: {
    key: 'apiKey',
    domain: 'example.com'
  },
  providers: ['sms','email','firebase']
}