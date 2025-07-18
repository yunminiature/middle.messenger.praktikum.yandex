import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/',
});

const window = dom.window as unknown as Window & typeof globalThis;

Object.defineProperty(global, 'window', {
    value: window,
    writable: true,
});

Object.defineProperty(global, 'document', {
    value: window.document,
    writable: true,
});

Object.defineProperty(global, 'HTMLElement', {
    value: window.HTMLElement,
    writable: true,
});

Object.defineProperty(global, 'Node', {
    value: window.Node,
    writable: true,
});

Object.defineProperty(global, 'MouseEvent', {
    value: window.MouseEvent,
    writable: true,
});

Object.defineProperty(global, 'getComputedStyle', {
    value: window.getComputedStyle,
    writable: true,
});
