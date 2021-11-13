console.log("[EXPRESS] Initializing server");
const config = require('config');

const express = require('express');
const app = express();

const cors = require('cors');
const { json, urlencoded } = require('body-parser');
const regitserAPIRoutes = require('../api');

const whitelisted = config.has('cors') ? config.get('cors') : '*';

if (whitelisted && Array.isArray(whitelisted)) {
  app.use(cors({ origin: (o,c) => whitelisted.includes(o) ? c(null,true) : c(new Error("Blocked by CORS policy. No access allowed!"),false) }));
} else if (whitelisted && typeof whitelisted === 'string') {
  app.use(cors(whitelisted));
} else {
  app.use(cors());
}

app.use(json());
app.use(urlencoded({ extended: true, limit: '2mb' }));

console.log("[EXPRESS] Registering routes");
regitserAPIRoutes(app);

app.listen(config.get('express').port, () => {
  console.log("[EXPRESS] Started server on port " + config.get('express').port);
});