FROM node:12.16.3
WORKDIR /home/sources/app
COPY package.json .
RUN npm install --quiet
EXPOSE 6868
COPY . .
CMD [ "node", "server.js" ]