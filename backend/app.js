const express = require('express');
const app = express();
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const projectsRoutes = require('./routes/projects');
const biographiesRoutes = require('./routes/biographies');
const logosRoutes = require('./routes/logos');
const backupRoutes = require('./routes/backup');
const usersRoutes = require('./routes/users');
const newslettersRoutes = require('./routes/newsletters');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const SECRET_MONGODBKEY = process.env.SECRET_MONGODBKEY;

mongoose.connect(SECRET_MONGODBKEY)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => console.error('Connexion à MongoDB échouée :', error.message));

/*-----------------------------------------------------------
MIDDLEWARES
-----------------------------------------------------------*/

app.use(helmet());

// Site public en lecture ouverte à tous les domaines
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content', 'Accept', 'Content-Type', 'Authorization'],
}));

app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log('[API] ', req.method, req.originalUrl);
    next();
  });
}

// Limite le brute-force sur le login et les abus sur l'envoi de newsletters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives, réessayez plus tard.' },
});

const newsletterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de requêtes, réessayez plus tard.' },
});

app.use('/api/users', loginLimiter, usersRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/biographies', biographiesRoutes);
app.use('/api/logos', logosRoutes);

// Une sauvegarde complète n'a pas lieu d'être déclenchée plus de quelques fois par heure
const backupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de requêtes, réessayez plus tard.' },
});
app.use('/api/backup', backupLimiter, backupRoutes);
app.use('/api/newsletters', newsletterLimiter, newslettersRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
