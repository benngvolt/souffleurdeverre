# Étape 1 : Utiliser une image Node.js pour builder l'application React
FROM node:16 AS build

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers package.json et package-lock.json (ou yarn.lock)
COPY package*.json ./

# Installer les dépendances du projet
RUN npm install

# Copier tous les fichiers de l'application
COPY . .

# Builder l'application React
RUN npm run build

# Étape 2 : Utiliser une image Nginx pour servir l'application
FROM nginx:alpine

# Copier les fichiers du build de l'application React vers le dossier Nginx pour servir les fichiers
COPY --from=build /app/build/ /usr/share/nginx/html/

# Exposer le port 8080 pour l'accès HTTP
EXPOSE 80

# Lancer Nginx
CMD ["nginx", "-g", "daemon off;"]