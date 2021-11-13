const scheduler = require('node-schedule');
const config = require('config');

const notificationModel = require('./models/notification.model');
const { segregateByProvider } = require('./helper');
const dispatchNotifications = require('./dispatch');

/** @type {string[]} */
const providers = config.get('providers');

// Start sending priority(4) notification every minute
scheduler.scheduleJob('* * * * *', async function (date) {
  console.log("[CRON] Sending priority(4) notifications in batches of 10 on " + date.toLocaleString());
  const promises = providers.map(p => notificationModel.find({ provider: p, dispacthed: null, priority: 4, campaingId: null }).limit(10).sort({ createdAt: -1 }));
  const settled = await Promise.all(promises);
  const notifications = segregateByProvider(settled);
  dispatchNotifications(notifications);
});

// Start sending priority(3,2) notification every minute
scheduler.scheduleJob('15 * * * *', async function (date) {
  console.log("[CRON] Sending priority(3,2) notifications in batches of 20 on " + date.toLocaleString());
  const promises = providers.map(p => notificationModel.find({ provider: p, dispacthed: null, priority: { $in: [3,2] }, campaingId: null }).limit(20).sort({ createdAt: -1 }));
  const settled = await Promise.all(promises);
  const notifications = segregateByProvider(settled);
  dispatchNotifications(notifications);
});

// Start sending priority(2) notification every minute
scheduler.scheduleJob('30 * * * *', async function (date) {
  console.log("[CRON] Sending priority(2) notifications in batches of 20 on " + date.toLocaleString());
  const promises = providers.map(p => notificationModel.find({ provider: p, dispacthed: null, priority: 2, campaingId: null }).limit(20).sort({ createdAt: -1 }));
  const settled = await Promise.all(promises);
  const notifications = segregateByProvider(settled);
  dispatchNotifications(notifications);
});

// Campaing dispatcher
scheduler.scheduleJob('0 2 * * *', function (date) {
  console.log("[CRON] Campaing dispacther started on " + date.toLocaleString());
});

// Clean data every night for sent notification
scheduler.scheduleJob('1 0 * * *', function (date) {
  console.log("[CRON] Cleaning service started on " + date.toLocaleString());
});
