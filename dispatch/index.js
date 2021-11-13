const fs = require('fs');
const config = require('config');
const path = require('path');
/** @type {string[]} */
const providers = config.get('providers');

/**
 * Dispatch notifications to proper provider
 * @param {{ [key: string]: any[]}} notifications Notification to dispacth
 */
function dispatchNotifications(notifications) {
  const notificationProviders = Object.keys(notifications);
  const dispatchers = providers.reduce((a,p) => {
    if (fs.existsSync( __dirname + '/' + p + '.dispatch.js')) {
      const dispatchFile = require(__dirname + '/' + p + '.dispatch');
      if ('dispatch' in dispatchFile) a[p] = dispatchFile;
    }
    return a;
  }, {});
  const foundDispatcher = Object.keys(dispatchers);
  const missingDispatcher = notificationProviders.filter(np => !foundDispatcher.includes(np));
  if (missingDispatcher.length) {
    missingDispatcher.forEach(md => {
      const providerModule = require(path.join(path.dirname(__dirname),'providers', md));
      if ('dispatch' in providerModule) {
        dispatchers[md] = providerModule;
      } else {
        delete notifications[md]
      }
    });
    Object.keys(dispatchers).forEach(d => missingDispatcher.includes(d) && delete missingDispatcher[d]);
  }
  missingDispatcher.length && console.log("[DISPATCHER] missing dispatcher for provider(s) \"" + missingDispatcher.join() + "\"");
  const providerName = Object.keys(notifications);
  providerName.length && console.log("[DISPATCHER] Dispatched for \"" + providerName.join() + "\"");
  providerName.forEach(p => dispatchers[p]['dispatch'](notifications[p]));
}

module.exports = dispatchNotifications;
