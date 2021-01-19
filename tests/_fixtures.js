const {JSDOM} = require('jsdom');

const {window} = new JSDOM('…');
global.document = window.document;
global.Node = window.Node;
global.Element = window.Element;
global.HTMLElement = window.HTMLElement;
global.SVGElement = window.SVGElement;
global.DocumentFragment = window.DocumentFragment;
global.EventTarget = window.EventTarget;
