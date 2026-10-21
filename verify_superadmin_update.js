const fs = require('fs');
const vm = require('vm');
const storage = {};
const localStorage = {
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null;
  },
  setItem(key, value) {
    storage[key] = String(value);
  },
  removeItem(key) {
    delete storage[key];
  }
};

const context = {
  console,
  localStorage,
  fetch: async () => ({ ok: true, json: async () => ({}) })
};

const code = fs.readFileSync('js/db.js', 'utf8');
vm.createContext(context);
vm.runInContext(code, context);
const DB = vm.runInContext('DB', context);
DB.init();

const before = DB.getStaff().find(s => s.role === 'super_admin');
const result = DB.updateUserCredentials(before.id, {
  name: 'Super Administrator',
  login_id: 'superadmin2',
  password: 'newpass123'
});
const after = DB.getStaff().find(s => s.id === before.id);

console.log(JSON.stringify({
  changed: result.success,
  user: after.login_id,
  pass: after.password,
  loginMatch: !!DB.getStaff().find(s => s.login_id.toLowerCase() === 'superadmin2' && s.password === 'newpass123')
}, null, 2));
