@echo off
cd /d "%~dp0services\core-api"
set NODE_ENV=development
set PORT=4000
npx nest start --watch

