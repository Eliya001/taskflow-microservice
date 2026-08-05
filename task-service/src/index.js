require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const routes = require('./routes');
const { createTable } = require('./model');

const app = express()
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/tasks', routes);

const start = async () => {
  await createTable();
  app.listen(PORT, () => {
    console.log(`Task Service running on port ${PORT}`);
  });
};

start();
