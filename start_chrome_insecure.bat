@echo off
REM Path to Google Chrome
set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"

REM Check if Chrome exists
if not exist %CHROME_PATH% (
    echo Error: Google Chrome not found at %CHROME_PATH%
    exit /b 1
)

REM Launch Chrome with --ignore-certificate-errors
start "" %CHROME_PATH% --ignore-certificate-errors https://127.0.0.1:8000/

REM Check if Chrome launched successfully
if %ERRORLEVEL% equ 0 (
    echo Chrome launched successfully.
) else (
    echo Error launching Chrome.
    exit /b 1
)

exit /b 0