'use strict';

module.exports = function(CodeMirror) {
    var SYMBOLS = '~`!@#$%^&*-_=+/|:<,>.?'.split('').join('\\');
    var VAR_RE_STR = '[$A-Za-z0-9_' + SYMBOLS + '\\x7f-\\uffff]+';

    CodeMirror.defineSimpleMode('runiq', {
        start: [
            {
                regex: /\`/,
                token: 'json_literal',
                next: 'json_literal'
            },
            {
                regex: /^-?\d*\.?\d+[A-Za-z_\%]+/i,
                token: 'number_with_suffix'
            },
            {
                regex: /0b[01]+|0o[0-7]+|0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?/i,
                token: 'number'
            },
            {
                regex: new RegExp(VAR_RE_STR),
                token: 'variable'
            },
            {
                regex: new RegExp('(\\(+)(' + VAR_RE_STR + ')+?(\\)+)?'),
                token: ['runiq-list-open', 'runiq-keyword', 'runiq-list-close'],
                indent: true
            },
            {
                regex: /\(/,
                indent: true,
                token: 'runiq-list-open'
            },
            {
                regex: /\)/,
                dedent: true,
                token: 'runiq-list-close'
            },
            {
                regex: /;/,
                token: 'comment',
                next: 'comment'
            },
            {
                regex: /"/,
                token: 'string',
                next: 'string'
            },
            {
                regex: /\[/,
                token: 'list_literal',
                next: 'list_literal'
            }
        ],
        json_literal: [
            { regex: /.*?\`/, token: 'json_literal', next: 'start'},
            { regex: /.*/, token: 'json_literal' }
        ],
        list_literal: [
            { regex: /.*?\]/, token: 'list_literal', next: 'start'},
            { regex: /.*/, token: 'list_literal' }
        ],
        comment: [
            { regex: /.*?;/, token: 'comment', next: 'start'},
            { regex: /.*/, token: 'comment' }
        ],
        string: [
            { regex: /.*?"/, token: 'string', next: 'start'},
            { regex: /[^\\"]*(?:\\[\s\S][^\\"]*)*/, token: 'string' }
        ],
        meta: {
            dontIndentStates: ['comment', 'string']
        }
    });

    CodeMirror.defineMIME('text/x-runiq', 'runiq');
};

