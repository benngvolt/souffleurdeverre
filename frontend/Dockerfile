FROM node:18-alpine

WORKDIR /frontend/
COPY public/ /frontend/public
COPY src/ /frontend/src
COPY package.json /frontend/

RUN npm install

EXPOSE 3000
CMD ["npm", "start"]

#démarrer le serveur avec:
#docker run -d -p 3000:3000 --name frontend-container frontend_image