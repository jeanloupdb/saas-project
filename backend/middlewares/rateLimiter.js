// backend/middlewares/rateLimiter.js

const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  handler: (req, res, /*next*/) => {
    console.log(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ message: 'Too many requests, please try again later.' });
  }
});

module.exports = limiter;

// backend/server.js

const express = require('express');
const limiter = require('./middlewares/rateLimiter');

const app = express();

// Apply the rate limiting middleware to all requests
app.use(limiter);

app.listen(5000, () => {
  console.log('Server running on port 5000');
});

