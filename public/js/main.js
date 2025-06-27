let $terminal1 = null;
let $terminal2 = null;

document.getElementById('btnTerminal1').addEventListener("click", () => {
    const oncreateCallback = function (that, options) {
        setTerminalTitle(that);
        const socket = new WebSocket('ws://localhost:8080');
        // https://github.com/xtermjs/xterm.js
        $terminal1 = initTerminal(getTerminalNodeElement(that));
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
            $terminal1.writeln('Connected to terminal server via websocket');
        };
        socket.onclose = () => {
            $terminal1.writeln('Disconnected from terminal server');
        };
    };
    initWinbox("Socket TerminaL", $terminal1, oncreateCallback);
});

document.getElementById('btnTerminal2').addEventListener("click", () => {
    const oncreateCallback = function (that, options) {
        setTerminalTitle(that);
        // https://github.com/xtermjs/xterm.js
        $terminal2 = initTerminal(getTerminalNodeElement(that));
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

        const addon = new CustomLinkdAddon(/#[\d]+/gu, (event, text) => {
            console.log(event);
            console.log('CustomLinkdAddon => ' + text);

        });
        $terminal2._terminal.loadAddon(addon);

        $terminal2.writeln('Check issue \x1b[34m#123\x1b[0m in the terminal.');

        $terminal2.writeln('Ajax Terminal ready. Type a command and press Enter.');
        setTimeout(() => $terminal2.resize(), 50);
    };
    initWinbox("Ajax TerminaL", $terminal2, oncreateCallback);
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