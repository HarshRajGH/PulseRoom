const fs = require('fs');
const crypto = require('crypto');

const generateSecret = () => crypto.randomBytes(48).toString('hex');

const serverEnvEx = fs.readFileSync('server/.env.example', 'utf-8');
const serverEnv = serverEnvEx
  .replace('replace_with_a_long_random_string', generateSecret())
  .replace('replace_with_a_different_long_random_string', generateSecret());
fs.writeFileSync('server/.env', serverEnv);
console.log('Created server/.env');

const clientEnvEx = fs.readFileSync('client/.env.example', 'utf-8');
fs.writeFileSync('client/.env', clientEnvEx);
console.log('Created client/.env');

const rootEnvEx = fs.readFileSync('.env.example', 'utf-8');
const rootEnv = rootEnvEx
  .replace('replace_with_a_long_random_string', generateSecret())
  .replace('replace_with_a_different_long_random_string', generateSecret());
fs.writeFileSync('.env', rootEnv);
console.log('Created .env');
