# FileServer
Simple file server for ShareX with web interface. This service also works with shortcuts iOS.

# Setup
## Download / Install
Clone the respository using:
```bash
git clone https://github.com/XenoWarrior/FileServer.git
```

Install the packages:
```bash
npm install
```

If you're deploying this to a server, you'll need to build the client-side app:
```bash
npm run build
```

In both cases, production or development, you should run the server:
```bash
npm run start
```

For a developement environment, use:
```bash
npm run serve
```
The `serve` script starts the webpack dev server on your local machine. Default port is 9000.
The webpack dev server automatically proxies `/api/v1/*` to `localhost:3030`. You can edit this in `webpack.config.js` under the `devServer.proxy` node.

Note: this service is not optimised yet. You will see a lot of warnings!

## Deployment
After building the client-side web app, drop the output files from the `dist` folder into your webserver. 

When deploying to a public server, consider using a persistent Docker container.
Just like the webpack dev server, your configuration must proxy `/api/v1/*` to the server or you'll hit a 404 error.
This can be done in nginx like so:
```bash
location @fallback {
    proxy_pass http://THE_IP:THE_PORT$1;
#   Example: proxy_pass http://127.0.0.1:3030$1;
}
```

# Todo List
* Include a docker-compose file.
* Include iOS upload shortcut example.

# Configuration Files
A `.sample` file has been provided for both server and client. Edit them as you need and remove the `.sample` from the file name.
## Server Configuration (.env)
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
* `SESSION_SECRET`= `Enter a value here, make it nice and secure`

## Client Configuration (.env.client)
**IMPORTANT**: **Do not** store secrets in this file as they are exposed client-side.
* `NODE_ENV`=`development` or `production`
* `API_URI_V1`=`/api/v1`