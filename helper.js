const config = require('config');
const Handlebars = require('handlebars');

const fs = require('fs');

/**
 * @type {string[]}
 */
const providers = config.get('providers');

/**
 * Check if data is valid for any given provider
 * @param {any} data Notification Data from other service
 */
module.exports.isDataValid = function (data) {
  if (data && 'type' in data) {
    const providerModules = providers.reduce((a,p) => {
      if (fs.existsSync('./providers/' + p + '.js')) {
        const provider = require('./providers/' + p);
        a[p] = provider;
        return a;
      }
    },{});
    const providerModule = providerModules[data.type];
    if (providerModule) {
      return { provider: providerModule, valid: providerModule.isValidData(data) };
    }
  }
  return false;
}

module.exports.stripKeys = function (obj, ...keys) {
  const existingKeys = Object.keys(obj);
  const nonExisting = existingKeys.filter(k => !keys.includes(k));
  return nonExisting.reduce((a,k) => { a[k] = obj[k]; return a }, {});
}

module.exports.buildQueryParams = function (obj) {
  return Object.entries(obj).reduce((a,c) => a += `&${c[0]}=${encodeURIComponent(c[1])}`, '');
}

module.exports.buildMongoURI = function(creds) {
  const queryParams = module.exports.stripKeys(creds, 'srv','username','password','host','port','database');
  const userString = creds.username ? `${encodeURIComponent(creds.username)}:${encodeURIComponent(creds.password)}@` : '';
  return `mongodb://${userString}${creds.host || 'localhost'}:${creds.port || 27017}/${creds.database || ''}?` + module.exports.buildQueryParams(queryParams);
}

module.exports.buildRedisURI = function(creds) {
  const queryParams = module.exports.stripKeys(creds,'username','password','host','port','database');
  const userString = creds.username ? `${encodeURIComponent(creds.username)}:${encodeURIComponent(creds.password)}@` : '';
  return `redis://${userString}${creds.host || 'localhost'}:${creds.port || 6379}/${creds.database || '0'}?` + module.exports.buildQueryParams(queryParams);
}

module.exports.populateTemplate = function(template, data) {
  return Handlebars.compile(template)(data);
}

module.exports.segregateByProvider = function (settled) {
  const notifications = {};
  settled = settled.flat();
  settled.forEach(s => {
    if (s.provider in notifications) {
      notifications[s.provider].push(s);
    } else {
      notifications[s.provider] = [s];
    }
  });
  return notifications;
}

/**
 * Data transform to Mongo compatible notification object
 * @param {any} data Notification data from other service
 */
module.exports.tranformToNotification = function (data) {
  const valid = module.exports.isDataValid(data);
  if (valid && valid.valid) {
    // tranformation should be done here
  }
  throw Error('Failed to tranform given data to notification - ' + JSON.stringify(data));
}
