let $terminal1 = null;
let $terminal2 = null;

initWinboxTerminal("#btnTerminal1", "Socket TerminaL", function (options) {
    const socket = initWebSocket();
    // https://github.com/xtermjs/xterm.js
    $terminal1 = initTerminal(options.terminalNode);
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
        $terminal1.writeln('Connected to terminal server via websocket');
    };
    socket.onclose = () => {
        $terminal1.writeln('Disconnected from terminal server');
    };
    // WebSocket connection for file upload
    const ufws = initWebSocket('/upload/file');
    ufws.onopen = () => console.log('WebSocket for file upload connected');
    ufws.onerror = (error) => console.error('WebSocket for file upload error:', error);
    ufws.onclose = () => console.log('WebSocket for file upload closed');
    const addon = new CustomLinkdAddon(/#[\d]+/gu, (event, text) => {
        createTerminalFileUploadModal(async (file, loadingModal, removeModal) => {
            if (!ufws || ufws.readyState !== WebSocket.OPEN) {
                console.error('WebSocket not connected');
                return;
            }
            if (file) {
                // Show loader and disable button
                loadingModal();
                // Send metadata first
                const metadata = {
                    type: 'metadata',
                    fileName: file.name,
                    fileSize: file.size
                };
                ufws.send(JSON.stringify(metadata));
                // Read and send file as binary
                const reader = new FileReader();
                reader.onload = (e) => {
                    ufws.send(e.target.result); // Send ArrayBuffer
                };
                reader.onerror = (e) => {
                    console.error('Error reading file:', e);
                    alert('Error while reading file!');
                    removeModal();
                };
                reader.readAsArrayBuffer(file); // Read file as binary
            } else {
                alert('No file selected!');
            }
            ufws.onmessage = (event) => {  
                console.log('Server response:', JSON.parse(event.data));
                removeModal();
            };
        });
    });
    $terminal1._terminal.loadAddon(addon);
    // \x1B[4m : underline, \x1B[24m : normal, \x1B[31m : redish text, \x1B[0m : white text
    $terminal1.writeln('Check issue \x1B[4m\x1B[31m#123\x1B[0m\x1B[24m in the terminal.');
    document.addEventListener('WinBoxTerminalResize', (e) => {
        if(e.detail.from === options.terminalNode.getAttribute('parent')) {
            $terminal1.resize();
        }
    });
});

initWinboxTerminal("#btnTerminal2", "Ajax TerminaL",  function (options) {
    // https://github.com/xtermjs/xterm.js
    $terminal2 = initTerminal(options.terminalNode);
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
        createTerminalFileUploadModal(async (file, loadingModal, removeModal) => {
            const formData = new FormData();
            formData.append('file', file);
            try {
                loadingModal();
                const response = await fetch('/file/upload', {
                    method: 'POST',
                    body: formData
                });
                if (response.ok) {
                    const result = await response.json();
                    console.log('Server response:', result);
                } else {
                    console.error('Upload failed:', response.statusText);
                }
            } catch (error) {
                console.error('Error during upload:', error);
            }
            removeModal();
        });
    });
    $terminal2._terminal.loadAddon(addon);
    // \x1B[4m : underline, \x1B[24m : normal, \x1B[31m : redish text, \x1B[0m : white text
    $terminal2.writeln('Check issue \x1B[4m\x1B[31m#123\x1B[0m\x1B[24m in the terminal.');

    $terminal2.writeln('Ajax Terminal ready. Type a command and press Enter.');
    document.addEventListener('WinBoxTerminalResize', (e) => {
        if(e.detail.from === options.terminalNode.getAttribute('parent')) {
            $terminal2.resize();
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