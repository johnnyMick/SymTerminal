# SymTerminal
Symfony + Xterminal
- https://symfony.com/
- https://github.com/ratchetphp/Ratchet
- https://xtermjs.org/


## Installation
1. Install dependencies:
```bash
composer install
php bin/console importmap:install
```

2. SSL:
```bash
symfony server:ca:install
```

## Start Server
1. Start the WebSocket server:
```bash
php bin/websocket.php
```

2. Start the Symfony server:
```bash
symfony server:start
```

3. Start Chrome with ignore-certificate-errors
```
.\start_chrome_insecure.bat
```

4. Start the local web mail catcher 
```
symfony open:local:webmail
```

### SSL Certificate for websocket.php
go to `bin/certs` then generate a certificate using `openssl`
```
openssl req -x509 -newkey rsa:4096 -keyout ssl.key -out ssl.crt -days 3650 -nodes -subj "/CN=localhost"
```

### Socket Debug
Install `wscat` package 
```
npm install -g wscat
wscat -c wss://localhost:8080/ --no-check
```