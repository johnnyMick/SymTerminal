import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { ClipboardAddon } from '@xterm/addon-clipboard';
import { ImageAddon } from '@xterm/addon-image';
import { SearchAddon } from '@xterm/addon-search';
import { SerializeAddon } from "@xterm/addon-serialize";
import { Unicode11Addon } from '@xterm/addon-unicode11';
// import { WebglAddon } from '@xterm/addon-webgl';

export const baseTheme = {
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

// customize as needed (showing addon defaults)
export const baseImageAddonOptions = {
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

// https://github.com/xtermjs/xterm.js
export function initTerminal(nodeElem, theme = {}, imageOptions = {}) {
    const $obj = {
        _terminal: new Terminal({
            fontFamily: '"Cascadia Code", Menlo, monospace',
            theme: { ...baseTheme, ...theme },
            cursorBlink: true,
            allowProposedApi: true
        }),
        buffer: '',
        addons: {
            fitAddon: new FitAddon(),
            searchAddon: new SearchAddon(),
            webLinksAddon: new WebLinksAddon(),
            serializeAddon: new SerializeAddon(),
            unicode11Addon: new Unicode11Addon(),
            clipboardAddon: new ClipboardAddon(),
            imageAddon: new ImageAddon({ ...baseImageAddonOptions, ...imageOptions }),
        },
        loadingInterval: null,
        startLoading: function() {
            const dots = ['.', '..', '...', '....', '.....'];
            let index = 0;
            this.write('\r\x1b[K⌛⏳ Loading'); // Clear line and write "Loading"
            this.loadingInterval = setInterval(() => {
                this.write('\r\x1b[K⌛⏳ Loading ' + dots[index % dots.length]); // Update dots
                index++;
            }, 150);
        },
        stopLoading: function() {
            if (this.loadingInterval) {
                clearInterval(this.loadingInterval);
                this.loadingInterval = null;
                this.write('\r\x1b[K'); // Clear the loading line
            }
        },
        write: function(data) {
            this._terminal.write(data);
        },
        writeLn: function(data) {
            this.write(data + '\r\n');
        },
        writeCommand: function(command) {
            this.write('\r\n' + 'Executing: ' + command + '\r\n');
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
    // $obj.terminal.loadAddon(new WebglAddon());
    $obj.addons.fitAddon.fit();

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