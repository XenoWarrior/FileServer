# FileServer
Simple file server for ShareX with web interface

# Setup
Clone the respository using:
```
git clone https://github.com/XenoWarrior/FileServer.git
```

Install the packages:
```
npm install
```

If you're deploying this to a server, you'll need to build the client-side app:
```
npm run build
```
For a developement environment, use:
```
npm run serve
```
The `serve` command starts the webpack dev server on your local machine. Defaults to port 9000.

In both cases, production or development, you should run the back-end:
```
npm run start
```

When deploying to a public server, consider using a Docker container. Use your webserver to proxy all other request URIs to your docker container internally. 
This can be done in nginx like so:
```

```

# TODO
* Include a docker-compose file.

# .env
### Server Configuration
* `APP_PORT`=`3030`

* `DB_HOST`=`localhost`
* `DB_USER`=`Enter your username`
* `DB_PASS`=`Enter your password`
* `DB_DATABASE`=`sharex_server`

* `UPLOAD_TABLE_V1`=`uploads`
* `USER_TABLE_V1`=`users`
* `VIEW_TABLE_V1`=`views`

* `API_V1`=`/api/v1`
* `NODE_ENV`=`development` or `production`

* `SESSION_SECRET`= `Enter a value here`

# .env.client
### Client Configuration
IMPORTANT: Do not store secrets in this file as they exposed to the client side.
* `NODE_ENV`=`development` or `production`
* `API_URI_V1`=`/api/v1`