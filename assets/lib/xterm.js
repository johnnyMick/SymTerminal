import { initTerminal } from './xterm-base.js';

// https://github.com/xtermjs/xterm.js
const $terminal1 = initTerminal(document.getElementById('terminal1'));

const socket = new WebSocket('ws://localhost:8080');

$terminal1.onEnterKey(async data => {
    socket.send(data);
    // start loading text animation
    $terminal1.startLoading();
});

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