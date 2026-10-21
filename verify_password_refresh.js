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

vm.createContext(context);
vm.runInContext(fs.readFileSync('js/db.js', 'utf8'), context);
const DB = vm.runInContext('DB', context);
DB.init();

const superAdmin = DB.getStaff().find(s => s.role === 'super_admin');
const result = DB.updateUserCredentials(superAdmin.id, {
  name: 'Super Administrator',
  login_id: 'superadmin',
  password: 'newpass123'
});

const current = DB.getCurrentUser();
const updated = DB.getStaff().find(s => s.id === superAdmin.id);

console.log(JSON.stringify({
  success: result.success,
  storedLogin: updated.login_id,
  storedPassword: updated.password,
  currentLogin: current.login_id,
  currentPassword: current.password
}, null, 2));
