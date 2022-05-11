#!/bin/bash
npm install --quiet
# migration
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
node server.js