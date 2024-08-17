#!/bin/sh

# Run the migrations
yarn run db:migration:run

# Start the application
yarn start:prod