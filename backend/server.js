require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const logger = require('./logger');
const authGoogleRoutes = require('./routes/authGoogleRoutes');
const cookieParser = require('cookie-parser');


// Initialisation d'Express
const app = express();

// Après avoir importé les autres modules
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    secure: false, // Assurez-vous que ce soit false puisque vous êtes en HTTP
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 jour
    sameSite: 'Strict', // 'Lax' est généralement suffisant pour les environnements HTTP, essayez 'None' si nécessaire
  }
}));



// Configuration CORS
app.use(cors({
  origin: 'http://localhost:3000', // URL du frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // Permettre l'envoi de cookies
}));
app.use(express.json());
app.use(helmet());

// Content Security Policy (CSP)
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

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par `window`
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Routes
logger.info('Définition des routes');
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/actions', require('./routes/actionRoutes'));
app.use('/api/token-wallets', require('./routes/tokenWalletRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));
app.use('/api/games', require('./routes/gameRoutes'));
app.use('/api/rewards', require('./routes/rewardRoutes'));
app.use('/api/data', require('./routes/dataRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/auth-google', authGoogleRoutes);
app.use('/api/google-places', require('./routes/googlePlacesRoutes'));




// Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
