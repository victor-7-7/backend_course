
const { Writable } = require('stream');
const crypto = require('crypto');

class AccountManager extends Writable {
    customers = [];
    #algorithm;
    #key;

    constructor(key, algorithm = 'aes192', options = {objectMode: true}) {
        super(options);
        this.#algorithm = algorithm;
        this.#key = key;
    }

    _write(chunk, encoding, done) {
        chunk.payload.email = this.#decryptString(chunk.payload.email);
        chunk.payload.password = this.#decryptString(chunk.payload.password);
        console.log('=> Decrypted customer: ', chunk.payload);
        this.customers.push(chunk.payload);
        done();
    }

    #decryptString = (encrypted) => {
        // For AES, iv size is always 16 bytes
        const iv = Buffer.from(encrypted, 'hex').slice(0, 16);
        const data = Buffer.from(encrypted, 'hex').slice(16);
        const decipher = crypto.createDecipheriv(this.#algorithm, this.#key, iv);
        let decrypted = decipher.update(data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    };
}

module.exports = { AccountManager };
