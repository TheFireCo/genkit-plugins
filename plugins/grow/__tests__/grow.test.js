'use strict';

const grow = require('..');
const assert = require('assert').strict;

assert.strictEqual(grow(), 'Hello from grow');
console.info('grow tests passed');
