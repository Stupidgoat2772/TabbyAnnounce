@echo off
cd /d %~dp0
node index.js >> tabby.log 2>&1
pause
