
const { Writable } = require('stream');
const crypto = require('crypto');

publicKey = '-----BEGIN CERTIFICATE-----\n' +
    'MIIB0TCCAToCCQCPzQvQNLrdWjANBgkqhkiG9w0BAQsFADAtMQswCQYDVQQGEwJy\n' +
    'dTENMAsGA1UEBwwEY2l0eTEPMA0GA1UEAwwGVmljdG9yMB4XDTIwMTAyNTA2MTMz\n' +
    'OFoXDTIwMTEyNDA2MTMzOFowLTELMAkGA1UEBhMCcnUxDTALBgNVBAcMBGNpdHkx\n' +
    'DzANBgNVBAMMBlZpY3RvcjCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEAudGY\n' +
    '7DseBzHUstzjl/gJOmEMKsYeBLcWMA4SOoGRs5HI9EdgCVS3K6zhxgkrFVDhPGzq\n' +
    'h6A2vRrhE/2oD2EMNIp4P+tpgt8ayEAv7kEeJP5gLMFq3C65hlH3ewB9Zzg6Tbns\n' +
    'KXe92MMZWEMrvUWoXUoaSzE88QBnyhgc05tihpcCAwEAATANBgkqhkiG9w0BAQsF\n' +
    'AAOBgQBAyVjjI8qVoiJedoU8/z0CkwNJUiaC40wW55Ih/LHDdDE1mVMeKqwQ18CE\n' +
    'eW4Femjqrg9wt30uFKGU59EmNyVQ8EUSoE2nAuwxdKnOK/vBvnT7HopO6yqznFyd\n' +
    'zzgJFN+ZWH/E/eUJGcoi/yBFGEO0k0bQxXEW9unYPg5zcdS8XQ==\n' +
    '-----END CERTIFICATE-----';

module.exports = class AccountManager extends Writable {
    customers = [];
    #algorithm;
    #key;

    constructor(key, algorithm = 'aes192', options = {objectMode: true}) {
        super(options);
        this.#algorithm = algorithm;
        this.#key = key;
    }

    _write(chunk, encoding, done) {
        if(chunk.hasOwnProperty('meta') && typeof chunk.meta === 'object'
            && chunk.meta.hasOwnProperty('signature')) {

            chunk.payload.email = this.#decryptString(chunk.payload.email);
            chunk.payload.password = this.#decryptString(chunk.payload.password);
            console.log('=> Decrypted customer: ', chunk.payload);

            const verify = crypto.createVerify('SHA256');
            verify.update(JSON.stringify(chunk.payload));
            verify.end();

            if (verify.verify(publicKey, chunk.meta.signature)) {
                console.log('Customer\'s data is verified!');
                this.customers.push(chunk.payload);
            } else {
                console.log('Customer\'s data is not authentic!');
            }
        }
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
