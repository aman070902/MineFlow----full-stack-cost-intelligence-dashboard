FROM postgres:16-alpine

COPY 01-schema.sql /docker-entrypoint-initdb.d/01-schema.sql
COPY 02-seed.sql /docker-entrypoint-initdb.d/02-seed.sql
