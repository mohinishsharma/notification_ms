const config = require('config');
const fs = require('fs');

const trigger = config.get('trigger') || 'redis';
console.log(`[NODE] ${trigger.toUpperCase()} trigger selected!`);

switch (trigger) {
  case 'api':
    require('./triggers/api');
    break;
  case 'redis':
    require('./triggers/redis');
    break;
  default:
    const e = fs.existsSync('./trigger/' + trigger);
    if (e) {
      console.log( "[" + trigger + "] Trigger loaded dynamically.");
      require('./triggers/' + trigger);
    } else {
      console.log("Unknown 'trigger' selected in config.");
      process.exit(1);
    }
}

require('./mongoose');
require('./cron.scheduler');
