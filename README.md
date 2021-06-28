# MyMemesAPI

API for [MyMemes](https://github.com/akcer/MyMemes) and [MyMemesNative](https://github.com/akcer/MyMemesNative) projects

## Demo

[MyMemesAPI](https://radiant-lowlands-32082.herokuapp.com/memes)

## Requirements

- Node.js
- MongoDB

## Installation

A little intro about the installation.

- Install MongoDB if you heven't done that yet
  [MongoDB Installation](https://docs.mongodb.com/manual/installation/)

- Clone project

```
$ git clone https://github.com/akcer/MyMemesAPI.git
```

- Enter the project directory:

```
$ cd MyMemesAPI
```

- Create .env file

```
$ touch .env
```

- Add following environment variables:

```
NODE_ENV=development
PORT=3001
CLIENT_HOST=http://localhost:3000
MOBILE_APP_HOST=http://localhost:19006
LOCAL_MACHINE_HOST= your local machine host
MONGODB_HOST=mongodb://localhost/mymemes
```

- Install NPM dependencies:

```
$ npm install
```

- Run the development server:

```
$ npm start
```

- Go to http://localhost:3001 to access the API.

## Technologies

- ExpressJS
- MongoDB
- Mongoose
- PassportJS
