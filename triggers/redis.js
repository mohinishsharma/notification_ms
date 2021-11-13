const redis = require('redis');
const config = require('config');
const { isDataValid, buildRedisURI, tranformToNotification } = require('../helper');
const notificationModel = require('../models/notification.model');
const dispatchNotifications = require('../dispatch');

const redisOption = config.has('redis') ? config.get('redis') : {
  host: 'localhost',
  port: 6379
}

const uri = buildRedisURI(redisOption);
console.log("[REDIS] Trying to connect : ", uri);
const client = redis.createClient(uri);

client.on('ready', function () {
  console.log("[REDIS] Connected!");
});

client.on('error', function (error) {
  console.log("[REDIS] Something failed : ", error);
  process.exit(1);
})

client.on('message', async function (channel, message) {
  try {
    const data = JSON.parse(message);
    if (channel === 'urgent') {
      const notification = await notificationModel.create(tranformToNotification(data));
      dispatchNotifications({ [notification.provider]: notification });
    } else if (channel == 'schedule') {
      await notificationModel.create(tranformToNotification(data));
    }
  } catch (error) {
    console.log("[REDIS] Failed to process notification : ", error);
  }
});

client.subscribe('urgent');
client.subscribe('schedule');

module.exports = client;