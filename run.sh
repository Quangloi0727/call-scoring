#!/bin/bash
npm install --quiet
# migration
npx sequelize-cli db:migrate
node server.js