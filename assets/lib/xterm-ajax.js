import { startLoading, stopLoading } from './xterm-base.js';
import { baseTheme, imageAddonCustomOptions, initTerminal } from './xterm-base.js';

// https://github.com/xtermjs/xterm.js
const $$obj2 = initTerminal(document.getElementById('terminal2'), baseTheme, imageAddonCustomOptions);

let buffer = '';

$$obj2.terminal.onData(async data => {
    if (data === '\r') {
        if (buffer.trim()) {
            $$obj2.terminal.write('\r\n'+'Executing: '+ buffer + '\r\n');
            // start loading text animation
            startLoading($$obj2.terminal);
            // send ajax message over http
            const message = await sendCommand(buffer);
            // stop the loading text animation
            stopLoading($$obj2.terminal);
            $$obj2.terminal.write(message);
        }
        buffer = '';
    } else if (data === '\b' || data.charCodeAt(0) === 127) {
        if (buffer.length > 0) {
            buffer = buffer.slice(0, -1);
            $$obj2.terminal.write('\b \b');
        }
    } else {
        buffer += data;
        $$obj2.terminal.write(data);
    }
});

$$obj2.terminal.write('Ajax Terminal ready. Type a command and press Enter.\r\n');

async function sendCommand(command) {
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
