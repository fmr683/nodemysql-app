#!/bin/sh

set -eux

npm run dbmigrate

exec "$@"