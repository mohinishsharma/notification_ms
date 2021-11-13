const fs = require('fs');
const config = require('config');
/** @type {string[]} */
const providers = config.get('providers');

/**
 * Dispatch notifications to proper provider
 * @param {{ [key: string]: any[]}} notifications Notification to dispacth
 */
function dispatchNotifications(notifications) {
  const notificationProviders = Object.keys(notifications);
  const dispatchers = providers.reduce((a,p) => {
    if (fs.existsSync('./' + p + '.dispatch.js')) {
      const dispatchFile = require('./' + p + '.dispatch');
      if ('dispatch' in dispatchFile) a[p] = dispatchFile.dispatch;
    }
    return a;
  }, {});
  const foundDispatcher = Object.keys(dispatchers);
  const missingDispatcher = notificationProviders.filter(np => !foundDispatcher.includes(np));
  missingDispatcher.length && missingDispatcher.forEach(md => delete notifications[md]);
  missingDispatcher.length && console.log("[DISPATCHER] missing dispatcher for provider(s) \"" + missingDispatcher.join() + "\"");
  const providerName = Object.keys(notifications);
  providerName.forEach(p => dispatchers[p](notifications[p]));
}

module.exports = dispatchNotifications;
