'use strict';

const assert = require('assert').strict;
const { Adhoc: AnsibleAdhoc, Cli: AnsibleCli } = require('../index.js');

const cmd = new AnsibleAdhoc();
const HOST_PATTERN = 'localhost';
const MODULE = 'command';
const FREE_FORM = 'ls';
const BECOME_USER = 'someone';
const INVENTORY = 'localhost,';
const REMOTE_USER = 'remote_user';

const ANSIBLE_ADHOC_STRING_OPTIONS = {
  'hostPattern': { throwsUnset: true, value: HOST_PATTERN },
  'module': { throwsUnset: true, arg: '-m', value: MODULE },
  'freeForm': { value: FREE_FORM },
  'remoteUser': { arg: '-u', value: REMOTE_USER },
  'becomeUser': { arg: '--become-user', value: BECOME_USER },
  'inventory': {arg: '-i', value: INVENTORY }
};

describe('AnsibleAdhoc', function() {
  it('should be instanceof AnsibleCli', function() {
    return assert(cmd instanceof AnsibleCli);
  });

  it('should be able to set options directly', function() {
    const optionsCmd = new AnsibleAdhoc({
      hostPattern: 'all'
    });
    return assert.equal(optionsCmd.hostPattern, 'all') && assert.equal(optionsCmd.freeForm, undefined);
  });

  // run tests for each item in ANSIBLE_ADHOC_STRING_OPTIONS
  for (const option in ANSIBLE_ADHOC_STRING_OPTIONS) {
    const methodName = option.charAt(0).toUpperCase() + option.slice(1);
    describe(`set${methodName}()`, function() {
      const throwsUnset = ANSIBLE_ADHOC_STRING_OPTIONS[option].throwsUnset;
      const arg = ANSIBLE_ADHOC_STRING_OPTIONS[option].arg;
      const value = ANSIBLE_ADHOC_STRING_OPTIONS[option].value;

      it(`should be undefined by default`, function() {
        return assert.equal(cmd[option], undefined);
      });

      if (throwsUnset) {
        it('should throw without it set', function() {
          return assert.throws(() => cmd.getCommandArguments());
        });
      } else {
        if (arg) {
          it('should not contain args', function() {
            return assert(
              !cmd.getCommandArguments().includes(arg)
            );
          });
        }
      }

      it('should be settable', function() {
        cmd[`set${methodName}`](value);
        return assert.equal(cmd[option], value);
      });

      if (arg) {
        it('should contain args after setting', function() {
          return assert(cmd.getCommandArguments().includes(arg));
        });
      }
    });
  }

  describe('setModuleArguments()', function() {
    it('should overwrite module arguments', function() {
      const moduleArguments = {
        chdir: '/tmp',
        test: 'value'
      };
      cmd.setModuleArguments(moduleArguments);
      return assert.equal(cmd.moduleArguments, moduleArguments);
    });
  });

  describe('deleteModuleArgument()', function() {
    it('should remove module argument', function() {
      const key = 'test';
      cmd.deleteModuleArgument(key);
      return assert.equal(cmd.moduleArguments[key], undefined);
    })
  });

  describe('setModuleArgument()', function() {
    it('should add module argument', function() {
      const key = 'chdir';
      const value = '/tmp'
      cmd.setModuleArgument(key, value);
      return assert.equal(cmd.moduleArguments[key], value);
    });
  });

  describe('buildModuleArguments()', function() {
    it('should build properly', function() {
      return assert.equal(cmd.buildModuleArguments(), `${FREE_FORM} chdir=/tmp`);
    });
  });

  describe('setExtraVariables()', function() {
    const extraVariables = {
      some: 'thing'
    };
    cmd.setExtraVariables(extraVariables);

    it('should set the extra variables', function() {
      return assert.equal(cmd.extraVariables, extraVariables);
    });

    it('should build into getCommandArguments()', function() {
      const extraVariablesIndex = cmd.getCommandArguments().indexOf('-e');
      return assert(
        extraVariablesIndex > -1
        && cmd.getCommandArguments()[extraVariablesIndex + 1] === JSON.stringify(extraVariables)
      );
    });

    it('should be removable', function() {
      cmd.setExtraVariables();
      const extraVariablesIndex = cmd.getCommandArguments().indexOf('-e');
      return assert(
        extraVariablesIndex === -1
        && !cmd.getCommandArguments().includes(JSON.stringify(extraVariables))
      );
    });
  });

  describe('getCommandArguments()', function() {
    it('should translate to ansible cli arguments', function() {
      return assert.deepEqual(
        cmd.getCommandArguments(),
        [HOST_PATTERN
          , '-m', MODULE
          , '-u', REMOTE_USER
          , '-b', '--become-user', BECOME_USER
          , '-i', INVENTORY
          , '-a', `${FREE_FORM} chdir=/tmp`
        ]
      );
    })
  });
});
