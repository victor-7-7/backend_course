
const { Ui } = require('./Ui');
const { Guardian } = require('./Guardian');
const { AccountManager } = require('./AccountManager');

const { promisify } = require('util');
const { pipeline } = require('stream');
const promisePipeline = promisify(pipeline);

const crypto = require('crypto');

const customers = [
    {
        name: 'Pitter Black',
        email: 'pblack@email.com',
        password: 'pblack_123'
    },
    {
        name: 'Oliver White',
        email: 'owhite@email.com',
        password: 'owhite_456'
    }
];
const ui = new Ui(customers);

const password = '1qaZxsw2@3edcVfr4';
const salt = crypto.randomBytes(16);
const key = crypto.scryptSync(password, salt, 24);

const guardian = new Guardian(key);
const manager = new AccountManager(key);

async function run() {
    await promisePipeline(ui, guardian, manager);
    console.log('Pipeline succeeded');
}

run().catch( err => console.error('Pipeline failed. ', err));

