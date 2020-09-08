import {createRequire} from 'module';
const require = createRequire(import.meta.url);

const {JSDOM} = require('jsdom');

const {window} = new JSDOM('…');
global.document = window.document;
global.Node = window.Node;
global.Element = window.Element;
global.DocumentFragment = window.DocumentFragment;
global.EventTarget = window.EventTarget;
