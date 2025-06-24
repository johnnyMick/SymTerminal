# SymTerminal
Symfony + Xterminal
- https://xtermjs.org/
- http://socketo.me/


## Installation
1. Install dependencies:
```bash
composer install
php bin/console importmap:install
```

2. Start the WebSocket server:
```bash
php bin/websocket.php
```

3. Start the Symfony server:
```bash
symfony server:start
```