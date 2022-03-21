FROM node:12.16.3
WORKDIR /home/sources/app
COPY package.json .
RUN npm install --quiet
ENV TZ=Asia/Ho_Chi_Minh
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
EXPOSE 6868
COPY . .
CMD [ "node", "server.js" ]