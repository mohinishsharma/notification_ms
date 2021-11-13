const config = require('config');

const mongoose = require('mongoose');
const { buildMongoURI } = require('./helper');
/**
 * @type {import('mongoose').Mongoose}
 */
let connection;
const credentials = config.has('mongoDB') ? config.get('mongoDB') : { host: 'localhost' };

const uri = buildMongoURI(credentials);
console.log("[MONGO] Trying to connect with : ", uri);

mongoose.connect(uri).then(conn => {
  console.log("[MONGO] Connected!");
  connection = conn;
}).catch(error => {
  console.log("[MONGO] Something went wrong : ", error);
  process.exit(1);
});

module.exports = connection;