import { baseTheme, imageAddonCustomOptions, initTerminal } from './xterm-base.js';

// https://github.com/xtermjs/xterm.js
const $$obj = initTerminal(document.getElementById('terminal'), baseTheme, imageAddonCustomOptions);

const socket = new WebSocket('ws://localhost:8080');
let buffer = '';

$$obj.terminal.onData(data => {
    if (data === '\r') {
        $$obj.terminal.write('\r\n'+'Executing: '+ buffer);
        socket.send(buffer);
        buffer = '';
        $$obj.terminal.write('\r\n');
    } else if (data === '\b' || data.charCodeAt(0) === 127) {
        if (buffer.length > 0) {
            buffer = buffer.slice(0, -1);
            $$obj.terminal.write('\b \b');
        }
    } else {
        buffer += data;
        $$obj.terminal.write(data);
    }
});

socket.onmessage = (event) => {
    $$obj.terminal.write(event.data);
};

socket.onopen = () => {
    $$obj.terminal.write('Connected to terminal server via websocket \r\n');
};

socket.onclose = () => {
    $$obj.terminal.write('Disconnected from terminal server\r\n');
};