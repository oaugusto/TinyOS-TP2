# Trabalho Prático 2 de IoT

### Instalar dependencias:
1. Node.js:
```
sudo apt-get install nodejs-legacy
```
2. Instalar **yarn**:
```
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn
```
3. Instalar pacotes necessarios
```
yarn add pug
yarn add express
yarn add socket.io
```
2. Gerencidaor de pacotes do Nodejs (**npm**)
```
sudo apt-get install npm
```
3. Pacotes **serialport**, **express**, **pug** e **socket.io**
```
npm install serialport express pug socket.io
```

### To Do:
1. Codigo para os nos

2. Codigo para o no base

3. Backend
- Montar modelo de mensagens
- Implementar recebimento de dados

3. Frontend 
- Montar corpo da pagina de exibicao.
- Fazer painel de exibicao de topologia.
- Fazer "mapa" de exibicao de temperatura.
- Fazer "mapa" de exibicao de luminosidade.  
