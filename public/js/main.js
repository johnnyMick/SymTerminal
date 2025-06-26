let $terminal1 = null;
let $terminal2 = null;

function setTerminalTitle(obj) {
    obj.setTitle("Terminal [" + obj.id.replace('winbox-', '')+"]");
}

function getTerminalNodeElement(obj) {
    return document.querySelector('#'+obj.id+' .terminal');
}

document.getElementById('btnTerminal1').addEventListener("click", () => {
    // https://nextapps-de.github.io/winbox/ 
    new WinBox("Socket Terminal", {
        class: "dark-winbox",
        width: 769,
        height: 710,
        icon: "img/terminal.png",
        html: '<div class="terminal bg-[#2D2E2C] w-full h-full p-2"></div>',
        oncreate: function(options) {
            setTerminalTitle(this);
            const socket = new WebSocket('ws://localhost:8080');
            // https://github.com/xtermjs/xterm.js
            $terminal1 = initTerminal(getTerminalNodeElement(this));
            $terminal1.onEnterKey(async data => {
                socket.send(data);
                // start loading text animation
                $terminal1.startLoading();
            });
            setTimeout(() => $terminal1.resize(), 50);
            // Check for Ctrl + K (ASCII code 11)
            $terminal1.onKeyPressed('\x0B', (data) => {
                alert('Terminal1 Buffer is: '+ data);
            });
            socket.onmessage = (event) => {
                // stop the loading text animation
                $terminal1.stopLoading();
                $terminal1.write(event.data);
            };
            socket.onopen = () => {
                $terminal1.writeLn('Connected to terminal server via websocket');
            };
            socket.onclose = () => {
                $terminal1.writeLn('Disconnected from terminal server');
            };
        },
        onresize: debounce(function(w, h) {
            if ($terminal1 && h > 35) {
                $terminal1.resize();
            }
        }, 300),
        onrestore: function(){
            this.g.style.transform = null;
        },
        onminimize: function(){
            const tmp = this.g.style.left;
            this.g.style.transform = 'translateX(calc(100vw - calc(100% + calc(2 * ' + tmp + '))))';
        },
        onmove: function(x, y){
            if(this.g.style.transform) {
                const tmp = this.g.style.left;
                this.g.style.transform = 'translateX(calc(100vw - calc(100% + calc(2 * ' + tmp + '))))';
            }
        }
    });
});

document.getElementById('btnTerminal2').addEventListener("click", () => {
    // https://nextapps-de.github.io/winbox/ 
    new WinBox("Ajax TerminaL", {
        class: "dark-winbox",
        width: 769,
        height: 710,
        icon: "img/terminal.png",
        html: '<div class="terminal bg-[#2D2E2C] w-full h-full p-2"></div>',
        oncreate: function(options) {
            setTerminalTitle(this);
            // https://github.com/xtermjs/xterm.js
            $terminal2 = initTerminal(getTerminalNodeElement(this));
            $terminal2.onEnterKey(async data => {
                // start loading text animation
                $terminal2.startLoading();
                // send ajax message over http
                const message = await sendTerminalCommandAjax(data);
                // stop the loading text animation
                $terminal2.stopLoading();
                $terminal2.write(message);
            });
            // Check for Ctrl + K (ASCII code 11)
            $terminal2.onKeyPressed('\x0B', (data) => {
                alert('Terminal2 Buffer is: '+ data);
            });
            $terminal2.writeLn('Ajax Terminal ready. Type a command and press Enter.');
            setTimeout(() => $terminal2.resize(), 50);
        },
        onresize: debounce(function(w, h) {
            if ($terminal2 && h > 35) {
                $terminal2.resize();
            }
        }, 300),
        onrestore: function(){
            this.g.style.transform = null;
        },
        onminimize: function(){
            const tmp = this.g.style.left;
            this.g.style.transform = 'translateX(calc(100vw - calc(100% + calc(2 * ' + tmp + '))))';
        },
        onmove: function(x, y){
            if(this.g.style.transform) {
                const tmp = this.g.style.left;
                this.g.style.transform = 'translateX(calc(100vw - calc(100% + calc(2 * ' + tmp + '))))';
            }
        }
    });
});

async function sendTerminalCommandAjax(command) {
    try {
        const response = await fetch('/terminal/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ command })
        });

        const result = await response.json();
        return result.output;
    } catch (error) {
        console.error('AJAX error:', error);
        return 'Error: Failed to execute command';
    }
}