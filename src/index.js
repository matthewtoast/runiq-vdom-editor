'use strict';

require('./styles/editor.css');
require('codemirror/lib/codemirror.css');
require('codemirror/theme/base16-dark.css');
require('./theme/runiq.css');

var CodeMirror = require('codemirror');
require('codemirror/addon/mode/simple');
require('./mode/runiq')(CodeMirror);

var RuniqVDOM = require('runiq-vdom');
var Renderer = RuniqVDOM.DOMRenderer;
var Context = RuniqVDOM.DOMContext;

var Assign = require('lodash.assign');

var EDITOR_TEMPLATE = require('./templates/editor.html');
var THEME = 'base16-dark';
var MODE = 'runiq';
var WORKER_NAME = 'runiq-vdom-editor-worker.bundle.js';
var RUNIQ_SOURCE_KEY = 'runiq-source';
var EXAMPLE_CODE = require('./templates/component.rune');

function Editor(mount, sourceCode, options) {
    if (!(this instanceof Editor)) return new Editor(mount);
    if (!mount) _raiseError('Mount element required');

    this.options = Assign({}, Editor.DEFAULT_OPTIONS, options || {});

    this.mount = mount;

    this.dom = document.createElement('div');
    this.dom.className = 'runiq-editor-wrapper';
    this.dom.innerHTML = EDITOR_TEMPLATE;

    this.dataPanel = this.dom.querySelector('.runiq-data-area');
    this.codeMount = this.dom.querySelector('.runiq-code-mount');
    this.demoMount = this.dom.querySelector('.runiq-demo-mount');
    this.astMount = this.dom.querySelector('.runiq-ast-mount');
    this.consoleMount = this.dom.querySelector('.runiq-console-mount');
    this.stateMount = this.dom.querySelector('.runiq-state-mount');

    if (!this.options.showDataPanel) {
        this.dataPanel.style.display = 'none';
    }

    this.codemirror = CodeMirror(this.codeMount, {
        lineNumbers: true,
        value: sourceCode,
        theme: THEME,
        mode: MODE
    });

    this.renderer = new Renderer();
    this.worker = new Worker(WORKER_NAME);
    this.context = new Context(this.demoMount, this.renderer, this.worker);
    this.context.initializeMount();

    this.context.listen(function(id, name, payload, via, state, outputs) {
        this.print(outputs);
        this.updateState(state);
        if (via === RUNIQ_SOURCE_KEY) this.updateAST(payload);
    }.bind(this));
}

Editor.EXAMPLE_CODE = EXAMPLE_CODE;

Editor.DEFAULT_OPTIONS = {
    showDataPanel: true
};

function _raiseError(msg) {
    throw new Error('Runiq [ERROR]: ' + msg);
}

Editor.prototype.print = function(outputs) {
    var messagesToPrint = [];
    for (var i = 0; i < outputs.length; i++) {
        var loggerInfo = outputs[i];
        var loggerMessages = loggerInfo.messages;
        var loggerMessage = loggerMessages[0];
        if (loggerMessage) messagesToPrint.push(loggerMessage);
    }
    var fullMessage = messagesToPrint.join('\n');
    this.consoleMount.textContent = 'Log:\n' + fullMessage;
};

Editor.prototype.updateState = function(state) {
    if (typeof state === 'object') state = JSON.stringify(state, null, 2);
    this.stateMount.textContent = 'Instance State:\n' + state;
};

Editor.prototype.updateAST = function(ast) {
    if (typeof ast === 'string') this.print([{messages:{0: ast}}]);
    if (typeof ast === 'object') ast = JSON.stringify(ast, null, 2);
    this.astMount.textContent = 'AST:\n' + ast;
};

Editor.prototype.deploy = function() {
    this.mount.appendChild(this.dom);
    this.codemirror.refresh();
    this.codemirror.on('changes', this.update.bind(this));
};

Editor.prototype.update = function(changes) {
    var code = this.codemirror.getValue();
    this.context.updateScript(code);
    this.context.send('run', {});
};

module.exports = Editor;
