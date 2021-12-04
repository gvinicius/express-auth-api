# Node Heroku Auth

This application is jwt auth based on heroku node example, for being used as auth and payload storage for many microservice-architectural apps

Fill the .env file for production and .env.development according to your targeted environment
variables.

Node version: 14.15.1

Npm version: 8.2.0

Configure mongo:
    $ docker run -d --name mongo -p 27017:27017 \
	  -v /somewhere/onmyhost/mydatabase:/data/db \
	  mvertes/alpine-mongo

(For testing) To use the mongo shell client:
    $ docker exec -ti mongo mongo
    $ use livepoetry;
    $ exit;

Install packages:
    $ npm i

Install nodemon for hot reload express:
    $ npm install nodemon -g

Run tests with jest using the following command:
    $ npm test

Run linter:
    $ npm run-script lint
