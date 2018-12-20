'use strict';

const { spawn } = require('child_process');
const ANSIBLE_COMMAND = 'ansible';

class AnsibleCli {
  constructor() {
    this.commandArguments = [];
  }

  /**
   * Executes the command, and returns the spawned child.
   * This child is documented here: https://nodejs.org/api/child_process.html#child_process_class_childprocess
   * @returns {ChildProcess}
   */
  /* istanbul ignore next */
  exec(args = []) {
    args.push(...this.commandArguments);
    return spawn(ANSIBLE_COMMAND, args, {});
  }

  /**
   * Adds an argument to the cli command.
   */
  addArgument(arg, value) {
    if (typeof arg !== 'string') {
      throw new TypeError('Argument "arg" should be typeof string');
    }

    this.commandArguments.push(arg);

    if (value !== undefined && value !== null) {
      this.commandArguments.push(value);
    }

    return this;
  }
}

const ANSIBLE_ADHOC_STRING_OPTIONS = ['module', 'freeForm', 'remoteUser', 'becomeUser', 'hostPattern', 'inventory'];
class AnsibleAdhoc extends AnsibleCli {
  constructor(options = {}) {
    super();

    for (const option of ANSIBLE_ADHOC_STRING_OPTIONS) {
      if (typeof options[option] === 'string') {
        this[`set${option.charAt(0).toUpperCase() + option.slice(1)}`](options[option]);
      }
    }

    this.moduleArguments = {};
    this.extraVariables = undefined;
  }

  /**
   * Sets the host-pattern for this command.
   * @param {String} mod
   * #returns {this}
   */
  setHostPattern(hostPattern) {
    this.hostPattern = hostPattern;
    return this;
  }

  /**
   * Sets the module for this command.
   * In the Ansible cli, this is specified by the -m argument.
   * @param {String} mod
   * #returns {this}
   */
  setModule(mod) {
    this.module = mod;
    return this;
  }

  /**
   * Sets the free form part for a module.
   * In the Ansible cli, this is specified by the -a argument,
   * together with the module arguments which can be set by the setModuleArguments() method.
   * @param {String} freeForm
   * @returns {this}
   */
  setFreeForm(freeForm) {
    this.freeForm = freeForm;
    return this;
  }

  /**
   * Connect to hosts using this user.
   * In the Ansible cli, this is specified by the -u or --user argument.
   * @param {String} user
   * @returns {this}
   */
  setRemoteUser(user) {
    this.remoteUser = user;
    return this;
  }

  /**
   * Privilege escalation; run operations as this user.
   * In the Ansible cli,
   * this is specified by a combination of the -b and --become-user arguments.
   * @param {String} user
   * @returns {this}
   */
  setBecomeUser(user) {
    this.becomeUser = user;
    return this;
  }

  /**
   * Sets the extra variables.
   * In the Ansible cli, this is specified by the -e or --extra-vars argument.
   * @param {Object} extraVariables
   * @returns {this}
   */
  setExtraVariables(extraVariables) {
    this.extraVariables = extraVariables;
    return this;
  }

  /**
   * Sets the inventory host path or comma seperated host list.
   * In the Ansible cli, this is specified by the -i or --inventory argument.
   * @param {String} inventory
   * @returns {this}
   */
  setInventory(inventory) {
    this.inventory = inventory;
    return this;
  }

  /**
   * Builds the Ansible specific module arguments
   * so it can be passed to the -a Ansible cli argument.
   * Uses this.freeForm and this.moduleArguments as sources.
   * @returns {String[]}
   */
  buildModuleArguments() {
    const args = [];
    if (this.freeForm) {
      args.push(this.freeForm);
    }

    const moduleArguments = this.moduleArguments;
    for (const key in moduleArguments) {
      args.push(`${key}=${moduleArguments[key]}`);
    }

    return args.join(' ');
  }

  /**
   * Returns the command arguments,
   * ready to be passed to super.exec();
   * @returns {String[]}
   */
  getCommandArguments() {
    /**
     * Build a seperate array of args instead of using super.addArgument().
     * Otherwise we polute the this.arguments[] and therefor
     * cannot call exec() multiple times with the same result (idempotence).
     */
    const args = [];

    // host pattern
    if (typeof this.hostPattern !== 'string') {
      throw new Error('"this.hostPattern" needs to be provided as string for AnsibleAdhoc commands');
    }
    args.push(this.hostPattern);

    // module
    if (typeof this.module !== 'string') {
      throw new Error('"this.module" needs to be provided as string for AnsibleAdhoc commands');
    }
    args.push('-m', this.module);

    // remote user
    if (typeof this.remoteUser === 'string') {
      args.push('-u', this.remoteUser);
    }

    // become
    if (typeof this.becomeUser === 'string') {
      args.push('-b', '--become-user', this.becomeUser);
    }

    // inventory
    if (typeof this.inventory === 'string') {
      args.push('-i', this.inventory);
    }

    // build the module arguments and add them to the command
    const moduleArguments = this.buildModuleArguments();
    args.push('-a', moduleArguments);

    // variables
    if (this.extraVariables) {
      args.push('-e', JSON.stringify(this.extraVariables));
    }

    return args;
  }

  /**
   * Sets all the arguments specific for the module used in setModule().
   * In the Ansible cli, this is specified by the -a argument,
   * together with the freeform which can be set by the setFreeForm() method.
   * @param {Object} moduleArguments A key-value store object.
   * @returns {this}
   */
  setModuleArguments(moduleArguments) {
    this.moduleArguments = moduleArguments;
    return this;
  }

  /**
   * Sets the value for a single argument (key) specific for the module used in setModule().
   * @param {String} key The key to store/overwrite in the module arguments.
   * @param {} value Value belonging to the given key to store/overwrite in the module arguments.
   * @returns {this}
   */
  setModuleArgument(key, value) {
    this.moduleArguments[key] = value;
    return this;
  }

  /**
   * Deletes the value for a single argument (key) specific for the module used in setModule().
   * @param {String} key The key to delete from the module arguments.
   * @returns {this}
   */
  deleteModuleArgument(key) {
    delete this.moduleArguments[key];
    return this;
  }

  /**
   * Executes the command, and returns the spawned child.
   * This child is documented here: https://nodejs.org/api/child_process.html#child_process_class_childprocess
   * @returns {ChildProcess}
   */
  /* istanbul ignore next */
  exec() {
    return super.exec(this.getCommandArguments());
  }

  /**
   * Executes the command and returns a promise with the output from the command.
   * @returns {Promise.<String>}
   */
  /* istanbul ignore next */
  execPromise() {
    return new Promise((resolve, reject) => {
      const child = this.exec();
      child.on('error', (err) => {
        reject(err);
      });

      /**
       * Ansible does not seem to respect stderr for writing of all errors.
       * So we simply combine stdout and stderr in the same output.
       */
      let output = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        output += data.toString();
      });

      let exitCode = 0;
      child.on('close', () => {
        if (exitCode) {
          return;
        }

        resolve(output);
      })

      child.on('exit', (code) => {
        exitCode = code;
        if (code) {
          reject(new Error(output));
        }
      });
    });
  }
}

module.exports = { Adhoc: AnsibleAdhoc, Cli: AnsibleCli };
