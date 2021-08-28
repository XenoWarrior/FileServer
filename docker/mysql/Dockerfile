FROM mysql:5.7

COPY ./database/sharex_server_tokens.sql /docker-entrypoint-initdb.d/
COPY ./database/sharex_server_uploads.sql /docker-entrypoint-initdb.d/
COPY ./database/sharex_server_users.sql /docker-entrypoint-initdb.d/
COPY ./database/sharex_server_views.sql /docker-entrypoint-initdb.d/

ENV MYSQL_ROOT_PASSWORD=password