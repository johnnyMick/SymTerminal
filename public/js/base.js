function now() {
  return Date.now || new Date().getTime();
}
function restArguments(func, startIndex) {
  startIndex = startIndex == null ? func.length - 1 : +startIndex;
  return function() {
    var length = Math.max(arguments.length - startIndex, 0),
        rest = Array(length),
        index = 0;
    for (; index < length; index++) {
      rest[index] = arguments[index + startIndex];
    }
    switch (startIndex) {
      case 0: return func.call(this, rest);
      case 1: return func.call(this, arguments[0], rest);
      case 2: return func.call(this, arguments[0], arguments[1], rest);
    }
    var args = Array(startIndex + 1);
    for (index = 0; index < startIndex; index++) {
      args[index] = arguments[index];
    }
    args[startIndex] = rest;
    return func.apply(this, args);
  };
}
function debounce(func, wait, immediate) {
  var timeout, previous, args, result, context;
  var later = function() {
    var passed = now() - previous;
    if (wait > passed) {
      timeout = setTimeout(later, wait - passed);
    } else {
      timeout = null;
      if (!immediate) result = func.apply(context, args);

      if (!timeout) args = context = null;
    }
  };
  var debounced = restArguments(function(_args) {
    context = this;
    args = _args;
    previous = now();
    if (!timeout) {
      timeout = setTimeout(later, wait);
      if (immediate) result = func.apply(context, args);
    }
    return result;
  });
  debounced.cancel = function() {
    clearTimeout(timeout);
    timeout = args = context = null;
  };
  return debounced;
}
function xtermBaseTheme() {
    return {
        foreground: '#F8F8F8',
        background: '#2D2E2C',
        selection: '#5DA5D533',
        black: '#1E1E1D',
        brightBlack: '#262625',
        red: '#CE5C5C',
        brightRed: '#FF7272',
        green: '#5BCC5B',
        brightGreen: '#72FF72',
        yellow: '#CCCC5B',
        brightYellow: '#FFFF72',
        blue: '#5D5DD3',
        brightBlue: '#7279FF',
        magenta: '#BC5ED1',
        brightMagenta: '#E572FF',
        cyan: '#5DA5D5',
        brightCyan: '#72F0FF',
        white: '#F8F8F8',
        brightWhite: '#FFFFFF'
    };
};
function xtermBaseImageAddonOptions() {
    return {
        enableSizeReports: true,    // whether to enable CSI t reports (see below)
        pixelLimit: 16777216,       // max. pixel size of a single image
        sixelSupport: true,         // enable sixel support
        sixelScrolling: true,       // whether to scroll on image output
        sixelPaletteLimit: 256,     // initial sixel palette size
        sixelSizeLimit: 25000000,   // size limit of a single sixel sequence
        storageLimit: 128,          // FIFO storage limit in MB
        showPlaceholder: true,      // whether to show a placeholder for evicted images
        iipSupport: true,           // enable iTerm IIP support
        iipSizeLimit: 20000000      // size limit of a single IIP sequence
    };
}
function initWebSocket(uri = '/', address = 'localhost', port = '8080') {
    const ws = new WebSocket(`ws://${address}:${port}${uri}`);
    return ws;
}
// https://github.com/xtermjs/xterm.js
function initTerminal(nodeElem, theme = {}, imageOptions = {}) {
    const baseTheme = xtermBaseTheme();
    const baseImageAddonOptions = xtermBaseImageAddonOptions();
    const $obj = {
        _terminal: new Terminal({
            fontFamily: '"Cascadia Code", Menlo, monospace',
            theme: { ...baseTheme, ...theme },
            cursorBlink: true,
            cursorStyle: 'underline',
            allowProposedApi: true
        }),
        buffer: '',
        addons: {
            fitAddon: new FitAddon.FitAddon(),
            searchAddon: new SearchAddon.SearchAddon(),
            webLinksAddon: new WebLinksAddon.WebLinksAddon(),
            serializeAddon: new SerializeAddon.SerializeAddon(),
            unicode11Addon: new Unicode11Addon.Unicode11Addon(),
            clipboardAddon: new ClipboardAddon.ClipboardAddon(),
            imageAddon: new ImageAddon.ImageAddon({ ...baseImageAddonOptions, ...imageOptions }),
        },
        loadingInterval: null,
        startLoading: function() {
            // https://www.npmjs.com/package/cli-spinners?activeTab=code
            // const dots = ['.', '.', '..', '..', '...', '...', '....', '....'];
            const dots = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
            // const emojis = ["🕛 ", "🕐 ", "🕑 ", "🕒 ", "🕓 ", "🕔 ", "🕕 ", "🕖 ", "🕗 ", "🕘 ", "🕙 ", "🕚 "];
            // const emojis = ["🔸 ", "🔶 ", "🟠 ", "🟠 ", "🔶 ", "🔹 ", "🔷 ", "🔵 ", "🔵 ", "🔷 "];
            const emojis = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖",	"🌗", "🌘"];
            let index = 0;
            this._terminal.options.cursorBlink = false;
            this._terminal.options.disableStdin = true;
            updateLoading = () => {
                let emoji = emojis[index % emojis.length];
                let dot = dots[index % dots.length];
                this.write('\r\x1b[K' + emoji + ' ' + dot + dot + dot + dot + dot + ' Loading...' );
                index++;
            };
            updateLoading();
            this.loadingInterval = setInterval(updateLoading, 100);
        },
        stopLoading: function() {
            if (this.loadingInterval) {
                clearInterval(this.loadingInterval);
                this.loadingInterval = null;
            }
            this._terminal.options.cursorBlink = true;
            this._terminal.options.disableStdin = false;
            this.write('\r\x1b[K'); // Clear the loading line
        },
        write: function(data) {
            this._terminal.write(data);
        },
        writeln: function(data) {
            this._terminal.writeln(data);
        },
        writeCommand: function(command) {
            this.writeln('');
            this.writeln('Executing: ' + command);
        },
        KeyPressedCallbacks: {
            '\r': function() {
                throw new Error("onEnterKeyPress callback function have not been set!");
            }
        },
        onEnterKey: function(callback) {
            if (typeof callback !== 'function') {
                throw new Error("callback must be a function!");
            }
            this.KeyPressedCallbacks['\r'] = callback;
        },
        onKeyPressed: function(key, callback) {
            if (typeof callback !== 'function') {
                throw new Error("callback must be a function!");
            }
            if (typeof key === '\r') {
                throw new Error("key '\r' can not be set here, use onEnterKey instead!");
            }
            if (typeof key === '\b') {
                throw new Error("key '\b' can not be overidden!");
            }
            this.KeyPressedCallbacks[key] = callback;
        },
        resize: function() {
            this.addons.fitAddon.fit();
        }
    };
    // working in the terminal.
    $obj._terminal.loadAddon($obj.addons.fitAddon);
    $obj._terminal.loadAddon($obj.addons.imageAddon);
    $obj._terminal.loadAddon($obj.addons.searchAddon);
    $obj._terminal.loadAddon($obj.addons.webLinksAddon);
    $obj._terminal.loadAddon($obj.addons.clipboardAddon);
    $obj._terminal.loadAddon($obj.addons.serializeAddon);
    $obj._terminal.loadAddon($obj.addons.unicode11Addon);
    $obj._terminal.unicode.activeVersion = '11';
    
    $obj._terminal.open(nodeElem);
    // $obj._terminal.loadAddon(new WebglAddon.WebglAddon());

    $obj._terminal.onData(async data => {
        if (data === '\r') {
            $obj.writeCommand($obj.buffer);
            $obj.KeyPressedCallbacks['\r']($obj.buffer);
            $obj.buffer = '';
        }
        else if ($obj.KeyPressedCallbacks[data]) {
            $obj.KeyPressedCallbacks[data]($obj.buffer);
        }
        else if (data === '\b' || data.charCodeAt(0) === 127) {
            if ($obj.buffer.length > 0) {
                $obj.buffer = $obj.buffer.slice(0, -1);
                $obj.write('\b \b');
            }
        } 
        else {
            $obj.buffer += data;
            $obj.write(data);
        }
    });

    return $obj;
}
// https://nextapps-de.github.io/winbox/ 
function initWinboxTerminal(selector, title, oncreateCallback) {
    document.querySelector(selector).addEventListener("click", () => {
        new WinBox(title, {
            class: "dark-winbox",
            width: 769,
            height: 710,
            icon: "img/terminal.png",
            html: '<div class="terminal bg-[#2D2E2C] w-full h-full p-2"></div>',
            oncreate: function(options) {
                const terminalNode = document.querySelector('#'+this.id+' .terminal');
                terminalNode.setAttribute('parent', selector);
                options.terminalNode = terminalNode;
                this.setTitle(title + "[" + this.id.replace('winbox-', '')+"]");
                oncreateCallback(options);
            },
            onresize: debounce((w, h) => {
                if (h > 35) {
                    document.dispatchEvent(new CustomEvent('WinBoxTerminalResize', {detail: {from: selector}}));
                }
            }, 300),
            onrestore: function(){
                this.g.style.transform = null;
            },
            onminimize: function(){
                const tmp = this.g.style.left;
                this.g.style.transform = 'translateX(calc(100vw - calc(100% + calc(2 * ' + tmp + '))))';
            },
            onmove: function(x, y) {
                if (this.g.style.transform) {
                    console.log(x, y);
                    const tmp = this.g.style.left;
                    this.g.style.transform = 'translateX(calc(100vw - calc(100% + calc(2 * ' + tmp + '))))';
                }
            }
        });
    });
}
// Function to create and show the modal
function createTerminalFileUploadModal(uploadCallback) {
    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'terminalFileModal';
    modal.className = 'fixed inset-0 bg-black/90 bg-opacity-50 flex items-center justify-center z-[99]';

    // Create modal content
    modal.innerHTML = `
    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="title text-xl font-bold mb-4">Upload a File</h2>
        <input type="file" id="terminalFileInput" class="mb-4 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600">
        <div class="flex justify-end space-x-2 action-bar">
            <button id="closeModalBtn" class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
            <button id="uploadBtn" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Upload</button>
        </div>
    </div>
    `;

    // Append modal to body
    document.body.appendChild(modal);

    // Get modal elements
    const closeModalBtn = modal.querySelector('#closeModalBtn');
    const uploadBtn = modal.querySelector('#uploadBtn');
    const fileInput = modal.querySelector('#terminalFileInput');

    // Close modal and remove it from DOM
    closeModalBtn.addEventListener('click', () => {
        modal.remove();
    });

    // Handle file upload and log content
    uploadBtn.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (file) {
            uploadCallback(file, 
            () => {
                modal.querySelector('.title').innerHTML = 'Uploading file.....';
                fileInput.classList.add('hidden');
                modal.querySelector('.action-bar').classList.add('hidden');

            }, 
            () => {
                modal.remove(); // Remove modal after upload attempt
            });
        } else {
            console.log('No file selected');
        }
    });
}