require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({
    status: 'API Gateway is running',
    services: {
      users: process.env.USER_SERVICE_URL,
      tasks: process.env.TASK_SERVICE_URL,
      notifications: process.env.NOTIFICATION_SERVICE_URL,
    }
  });
});

app.use('/api/users', createProxyMiddleware({
  target: process.env.USER_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
}));


app.use('/api/tasks', createProxyMiddleware({
  target: process.env.TASK_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
}));


app.use('/api/notifications', createProxyMiddleware({
  target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
}));

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
