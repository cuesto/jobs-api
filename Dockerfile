FROM node:12.13.0-alpine

RUN apk --no-cache add --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers autoconf automake make nasm python git && \
  npm install --quiet node-gyp -g

WORKDIR /usr/src/app/

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 8080

CMD ["node", "src/index.js"]