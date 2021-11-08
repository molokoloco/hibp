FROM node:lts-alpine

ADD public /opt/app/public
ADD src /opt/app/src
WORKDIR /opt/app
COPY package.json ./

RUN npm install

CMD ["npm", "start"]