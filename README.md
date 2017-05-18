# Trabalho Prático 2 de IoT

### Instalar dependencias:
1. Instalar **yarn**:
```
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn
```
2. Instalar pacotes necessarios
```
yarn add pug
yarn add express
yarn add socket.io
yarn add serialport
yarn add timer
yarn add json-socket
```
