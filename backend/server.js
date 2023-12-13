// Module permet de créer serveur HTTP et de gérer les requêtes entrantes et sortantes.
const http = require('http');

// Importe module app depuis fichier local app.js. Contient la config de notre app Express, y compris définition des routes et des middlewares.
const app = require('./app');


// CORS
// const cors = require('cors');

// app.use(cors({ origin: process.env.ORIGIN }));

// const corsOptions = {
//   origin: process.env.ORIGIN, // Remplacez par l'origine autorisée
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Méthodes HTTP autorisées
//   credentials: true, // Autorisez l'envoi de cookies et d'en-têtes d'autorisation
// };

// app.use(cors(corsOptions));


// Fonction normalizePort renvoie un port valide, qu'il soit fourni sous la forme d'un numéro ou d'une chaîne ;
const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

const port = normalizePort(process.env.PORT || '3000');

// Configure le port sur lequel notre serveur va écouter les requêtes. 
// Elle utilise app.set pour définir une propriété port sur l'objet app (qui représente notre application Express). 
// Le port est déterminé par process.env.PORT, qui est une variable d'environnement permettant de spécifier le port lors de l'exécution de l'application. Si process.env.PORT n'est pas défini, le port par défaut sera 3000.
app.set('port', port);


// La fonction errorHandler  recherche les différentes erreurs et les gère de manière appropriée. Elle est ensuite enregistrée dans le serveur ;
const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};


//Ici, nous utilisons la méthode http.createServer() pour créer un serveur HTTP en passant notre application app en tant que gestionnaire de requêtes. 
//Cela signifie que toutes les requêtes entrantes seront gérées par notre application Express.
const server = http.createServer(app);

// Ces deux lignes de code ajoutent des gestionnaires d'événements à l'objet server. 
// Le premier gestionnaire d'événement s'occupe des erreurs, et le deuxième gestionnaire d'événement est déclenché lorsque le serveur commence à écouter les requêtes. 
// Ces gestionnaires d'événements permettent de réagir et de prendre des mesures appropriées en cas d'erreur ou lorsque le serveur est en écoute.
server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

//Enfin, nous utilisons la méthode server.listen() pour démarrer le serveur et l'écouter sur le port spécifié. 
//Encore une fois, nous utilisons process.env.PORT pour récupérer le port à partir des variables d'environnement, ou nous utilisons le port par défaut 3000 si aucune valeur n'est définie.
server.listen(port);


// En résumé, ce code crée un serveur Node.js qui utilise Express pour gérer les requêtes HTTP entrantes. 
//Il configure le port sur lequel le serveur écoute et démarre le serveur pour commencer à accepter les requêtes.