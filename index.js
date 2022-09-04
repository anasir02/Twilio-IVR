require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const router = require('./src/router');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(router);

const PORT = process.env.PORT;
// Create an HTTP server and listen for requests on port 3000
app.listen(PORT, () => {
  console.log(
    `Server listening on port ${PORT}`
  );
});

module.exports = app;