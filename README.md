# FileServer
Simple file server for ShareX with web interface

# Supports
* Upload via ShareX
* Upload via iOS/iPadOS Shortcut (TODO: Share how-to)

# Setup
1) `npm install`
2) `npm run build` or `npm run serve` (client-side)
3) `npm run start` (server)

# Todo:
* Split server / client to separate deps.

# Environment Configuration
Create these file locally, don't commit them!

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
