

module.exports.provider = {};
/**
 * Check if data is suitable for this particular provider  
 * NOTE: This function is necessary for provider to work otherwise provider will be skipped
 * @param {any} data Notification data from other service
 */
module.exports.isValidData = function (data) {
  const shouldHave = ['token', 'title' ,'message', 'c2a'];
  const dataKeys = Object.keys(data);
  return shouldHave.reduce((a,c) => a && dataKeys.includes(c), true);
}