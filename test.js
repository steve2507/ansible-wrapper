const Ansible = require('./index.js');
const cmd = new Ansible.Adhoc({
  module: 'command'
});
cmd.setHostPattern('all').setInventory('localhost,').setFreeForm('echo "hello world"');
(async () => {
  const result = await cmd.execPromise();
  console.log(result);
})();
