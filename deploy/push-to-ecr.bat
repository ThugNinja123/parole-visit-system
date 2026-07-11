@echo off
setlocal

rem Thin wrapper so this can be double-clicked / run from cmd.exe.
rem All arguments are forwarded to push-to-ecr.ps1, e.g.:
rem   push-to-ecr.bat -AwsAccountId 123456789012 -AwsRegion ap-south-1 -ViteApiBaseUrl https://api.yourdomain.com/api

set SCRIPT_DIR=%~dp0

powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%push-to-ecr.ps1" %*
set EXIT_CODE=%ERRORLEVEL%

endlocal & exit /b %EXIT_CODE%
