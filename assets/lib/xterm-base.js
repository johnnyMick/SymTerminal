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
export const imageAddonCustomOptions = {
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
export function initTerminal(nodeElem, baseTheme, imageAddonCustomOptions) {
    const $obj = {
        terminal: new Terminal({
            fontFamily: '"Cascadia Code", Menlo, monospace',
            theme: baseTheme,
            cursorBlink: true,
            allowProposedApi: true
        }),
        addons: {
            fitAddon: new FitAddon(),
            searchAddon: new SearchAddon(),
            webLinksAddon: new WebLinksAddon(),
            serializeAddon: new SerializeAddon(),
            unicode11Addon: new Unicode11Addon(),
            clipboardAddon: new ClipboardAddon(),
            imageAddon: new ImageAddon(imageAddonCustomOptions),
        }
    };
    // working in the terminal.
    $obj.terminal.loadAddon($obj.addons.fitAddon);
    $obj.terminal.loadAddon($obj.addons.imageAddon);
    $obj.terminal.loadAddon($obj.addons.searchAddon);
    $obj.terminal.loadAddon($obj.addons.webLinksAddon);
    $obj.terminal.loadAddon($obj.addons.clipboardAddon);
    $obj.terminal.loadAddon($obj.addons.serializeAddon);
    $obj.terminal.loadAddon($obj.addons.unicode11Addon);
    $obj.terminal.unicode.activeVersion = '11';
    
    $obj.terminal.open(nodeElem);
    // $obj.terminal.loadAddon(new WebglAddon());
    $obj.addons.fitAddon.fit();

    return $obj;
}

export function startLoading($terminal) {
    $terminal.write('\r\x1b[K⌛⏳ Loading...'); // Clear line and write "Loading"
}

export function stopLoading($terminal) {
    $terminal.write('\r\x1b[K'); // Clear the loading line
}