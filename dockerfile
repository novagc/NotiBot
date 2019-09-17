FROM node:12
WORKDIR /opt/NotiBot
VOLUME /archive
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 8888
CMD ["npm", "start"]