# ansible-wrapper

Wraps the [ansible CLI](https://docs.ansible.com/ansible/latest/cli/ansible.html) in a convenient NodeJS wrapper.

## Installation
You will need to have ansible installed on the same machine where your nodejs application will be running.

`npm install ansible-wrapper`

## Examples

### Basic usage
```javascript
const Ansible = require('ansible-wrapper');
const cmd = new Ansible.Adhoc({
  hostPattern: 'localhost',
  module: 'command',
  freeForm: 'echo "hello world"'
});

const result = await cmd.execPromise();
console.log(result);
```

### Daisy chain
Or daisy chain the applicable functions to set the options. This results in the same as previous example.
```javascript
const Ansible = require('ansible-wrapper');
const cmd = new Ansible.Adhoc();
cmd.setHostPattern('localhost')
  .setModule('command')
  .setFreeForm('echo "hello world"');

const result = await cmd.execPromise();
console.log(result);
```

### Custom arguments
Arguments which are not supported by this library, can be set by using the `addArgument()` method which `Ansible.Adhoc` inherits from `Ansible.Cli`.
```javascript
const Ansible = require('ansible-wrapper');
const cmd = new Ansible.Adhoc({
  hostPattern: 'localhost',
  module: 'command',
  freeForm: 'echo "hello world"'
});

// add the arguments
cmd.addArgument('-C');
cmd.addArgument('-B', 8);
cmd.addArgument('--verbose');
```

## Documentation
[The code](index.js) has extensive JsDoc available. This is not yet exposed on a dedicated site.
