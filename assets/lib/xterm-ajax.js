import { initTerminal } from './xterm-base.js';

async function sendCommandAjax(command) {
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

// https://github.com/xtermjs/xterm.js
const $terminal2 = initTerminal(document.getElementById('terminal2'));

$terminal2.onEnterKey(async data => {
    // start loading text animation
    $terminal2.startLoading();
    // send ajax message over http
    const message = await sendCommandAjax(data);
    // stop the loading text animation
    $terminal2.stopLoading();
    $terminal2.write(message);
});

// Check for Ctrl + K (ASCII code 11)
$terminal2.onKeyPressed('\x0B', (data) => {
    alert('Terminal2 Buffer is: '+ data);
});

$terminal2.writeLn('Ajax Terminal ready. Type a command and press Enter.');
