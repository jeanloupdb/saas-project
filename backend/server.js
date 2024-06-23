require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./logger');

logger.info('Avant importation des routes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const actionRoutes = require('./routes/actionRoutes');
const tokenWalletRoutes = require('./routes/tokenWalletRoutes');
const companyRoutes = require('./routes/companyRoutes');
logger.info('Après importation des routes');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(helmet());

// Content Security Policy
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "example.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "example.com"],
    imgSrc: ["'self'", "data:", "example.com"],
    connectSrc: ["'self'", "example.com"],
    fontSrc: ["'self'", "example.com"],
    objectSrc: ["'none'"],
    frameAncestors: ["'self'"],
    baseUri: ["'self'"],
    formAction: ["'self'"]
  }
}));

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => logger.info('MongoDB Connected'))
  .catch(err => logger.error(`MongoDB connection error: ${err.message}`));

// Routes
logger.info('Définition des routes');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/token-wallets', tokenWalletRoutes);
app.use('/api/companies', companyRoutes);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);

function errorHandler(err, req, res, next) {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ message: 'Server error', error: err.message });
}

app.use(errorHandler);

// Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
