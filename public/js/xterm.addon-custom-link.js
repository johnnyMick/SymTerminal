// https://github.com/xtermjs/xterm.js/blob/master/addons/addon-web-links/src/WebLinksAddon.ts

const baseCustomLinkOptions = {
    decorations: {
        pointerCursor: true,
        underline: true,
    },
    hover: (event, uri) => {},
    leave: (event, uri) => {},
    dispose: () => {}
};

class CustomLinkdAddon {
    constructor(regex, handler, options) {
        this.regex = regex;
        this.handler = handler;
        this.options = { ...baseCustomLinkOptions, options};
    }

    activate(terminal) {
        this._terminal = terminal;
        this._linkProvider = this._terminal.registerLinkProvider(new CustomLinkProvider(this._terminal, this.regex, this.handler, this.options));
    }

    dispose() {
        this._linkProvider?.dispose();
    }
}

// https://github.com/xtermjs/xterm.js/blob/master/addons/addon-web-links/src/WebLinkProvider.ts
class CustomLinkProvider {
    constructor(terminal, regex, handler, options) {
        this._regex = regex;
        this._handler = handler;
        this._terminal = terminal;
        this._options = options;
    }

    provideLinks(bufferLineNumber, callback) {
        const links = CustomLinkComputer.computeLink(bufferLineNumber, this._regex, this._terminal, this._handler);
        callback(this._addCallbacks(links));
        return;
    }

    _addCallbacks(links) {
        return links.map(link => {
            link.decorations = this._options.decorations;
            link.leave = this._options.leave;
            link.hover = this._options.hover;
            link.dispose = this._options.dispose;
            return link;
        });
    }
}

CustomLinkComputer  = {
    computeLink: function (y, regex, terminal, activate) 
    {
        const rex = new RegExp(regex.source, (regex.flags || 'g'));
        const [lines, startLineIndex] = CustomLinkComputer._getWindowedLineStrings(y - 1, terminal);
        const line = lines.join('');
        let match;
        const result = [];
        while (match = rex.exec(line)) {
            const text = match[0];
            // map string positions back to buffer positions
            // values are 0-based right side excluding
            const [startY, startX] = CustomLinkComputer._mapStrIdx(terminal, startLineIndex, 0, match.index);
            const [endY, endX] = CustomLinkComputer._mapStrIdx(terminal, startY, startX, text.length);

            if (startY === -1 || startX === -1 || endY === -1 || endX === -1) {
                continue;
            }

            // range expects values 1-based right side including, thus +1 except for endX
            const range = {
                start: {
                    x: startX + 1,
                    y: startY + 1
                },
                end: {
                    x: endX,
                    y: endY + 1
                }
            };
            // xtermjs link, need a range, a text, and a callback function to activate on click 
            result.push({ range, text, activate });
        }
        return result;
    },
    /**
     * Get wrapped content lines for the current line index.
     * The top/bottom line expansion stops at whitespaces or length > 2048.
     * Returns an array with line strings and the top line index.
     *
     * NOTE: We pull line strings with trimRight=true on purpose to make sure
     * to correctly match urls with early wrapped wide chars. This corrupts the string index
     * for 1:1 backmapping to buffer positions, thus needs an additional correction in _mapStrIdx.
     */
    _getWindowedLineStrings: function (lineIndex, terminal)
    {
        let line;
        let topIdx = lineIndex;
        let bottomIdx = lineIndex;
        let length = 0;
        let content = '';
        const lines = [];
        if ((line = terminal.buffer.active.getLine(lineIndex))) {
            const currentContent = line.translateToString(true);

            // expand top, stop on whitespaces or length > 2048
            if (line.isWrapped && currentContent[0] !== ' ') {
                length = 0;
                while ((line = terminal.buffer.active.getLine(--topIdx)) && length < 2048) {
                    content = line.translateToString(true);
                    length += content.length;
                    lines.push(content);
                    if (!line.isWrapped || content.indexOf(' ') !== -1) {
                    break;
                    }
                }
                lines.reverse();
            }
            // append current line
            lines.push(currentContent);
            // expand bottom, stop on whitespaces or length > 2048
            length = 0;
            while ((line = terminal.buffer.active.getLine(++bottomIdx)) && line.isWrapped && length < 2048) {
                content = line.translateToString(true);
                length += content.length;
                lines.push(content);
                if (content.indexOf(' ') !== -1) {
                    break;
                }
            }
        }
        return [lines, topIdx];
    },
    /**
     * Map a string index back to buffer positions.
     * Returns buffer position as [lineIndex, columnIndex] 0-based,
     * or [-1, -1] in case the lookup ran into a non-existing line.
     */
    _mapStrIdx: function (terminal, lineIndex, rowIndex, stringIndex)
    {
        const buf = terminal.buffer.active;
        const cell = buf.getNullCell();
        let start = rowIndex;
        while (stringIndex) {
            const line = buf.getLine(lineIndex);
            if (!line) {
                return [-1, -1];
            }
            for (let i = start; i < line.length; ++i) {
                line.getCell(i, cell);
                const chars = cell.getChars();
                const width = cell.getWidth();
                if (width) {
                    stringIndex -= chars.length || 1;
                    // correct stringIndex for early wrapped wide chars:
                    // - currently only happens at last cell
                    // - cells to the right are reset with chars='' and width=1 in InputHandler.print
                    // - follow-up line must be wrapped and contain wide char at first cell
                    // --> if all these conditions are met, correct stringIndex by +1
                    if (i === line.length - 1 && chars === '') {
                        const line = buf.getLine(lineIndex + 1);
                        if (line && line.isWrapped) {
                            line.getCell(0, cell);
                            if (cell.getWidth() === 2) {
                                stringIndex += 1;
                            }
                        }
                    }
                }
                if (stringIndex < 0) {
                    return [lineIndex, i];
                }
            }
            lineIndex++;
            start = 0;
        }
        return [lineIndex, start];
    }
}