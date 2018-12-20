'use strict';

const assert = require('assert').strict;
const { Cli: AnsibleCli } = require('../index.js');

const cmd = new AnsibleCli();

describe('AnsibleCli', function() {
  describe('addArgument()', function() {
    it('should be an empty array by default', function() {
      return assert.deepEqual(cmd.commandArguments, []);
    });

    it('should add an argument without value', function() {
      cmd.addArgument('novalue');
      return assert.deepEqual(cmd.commandArguments, ['novalue']);
    });

    it('should add an argument', function() {
      cmd.addArgument('test', 'value');
      return assert.deepEqual(cmd.commandArguments, ['novalue', 'test', 'value']);
    });

    it('should throw without string arg', function() {
      return assert.throws(() => cmd.addArgument(5));
    });

    it('should return this', function() {
      return assert.equal(cmd.addArgument('str'), cmd);
    });
  });
});
