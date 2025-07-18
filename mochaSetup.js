import {JSDOM} from 'jsdom'

const jsdom = new JSDOM(`<body></body>`, {
    url: 'http://localhost',
});

global.window = jsdom.window;
global.document = jsdom.window.document;
global.MouseEvent = jsdom.window.MouseEvent;
global.HTMLElement = jsdom.window.HTMLElement;
global.getComputedStyle = jsdom.window.getComputedStyle;
global.Node = jsdom.window.Node;
