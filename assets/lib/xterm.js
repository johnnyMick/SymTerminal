import { initTerminal } from './xterm-base.js';

// https://github.com/xtermjs/xterm.js
const $terminal = initTerminal(document.getElementById('terminal1'));

const socket = new WebSocket('ws://localhost:8080');

$terminal.onEnterKeyPress(async data => {
    socket.send(data);
    // start loading text animation
    $terminal.startLoading();
});

socket.onmessage = (event) => {
    // stop the loading text animation
    $terminal.stopLoading();
    $terminal.write(event.data);
};

socket.onopen = () => {
    $terminal.writeLn('Connected to terminal server via websocket');
};

socket.onclose = () => {
    $terminal.writeLn('Disconnected from terminal server');
};