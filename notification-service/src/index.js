require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const routes = require('./routes');
const { createTable } = require('./model');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/notifications', routes);

const start = async () => {
  await createTable();
  app.listen(PORT, () => {
    console.log(`Notification Service running on port ${PORT}`);
  });
};

start();
