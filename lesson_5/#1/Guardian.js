
const { Transform } = require('stream');
const crypto = require('crypto');

class Guardian extends Transform {
    #rsName;
    #algorithm;
    #key;

    constructor(key, algorithm = 'aes192',
        options = {
        readableObjectMode: true,
        writableObjectMode: true
    }) {
        super(options);
        this.#algorithm = algorithm;
        this.#key = key;
        this.on('pipe', (src) => {
            this.#rsName = src.constructor.name;
        });
    }

    _transform(chunk, encoding, done) {
        chunk.email = this.#encryptString(chunk.email);
        chunk.password = this.#encryptString(chunk.password);
        const modifiedChunk = {
            meta: {source: this.#rsName},
            payload: chunk,
        };
        console.log('=> Encrypted customer: ', modifiedChunk);
        this.push(modifiedChunk);
        done();
    }

    #encryptString = (originStr) => {
        // For AES, iv size is always 16 bytes
        const iv = crypto.randomFillSync(Buffer.alloc(16));
        const cipher = crypto.createCipheriv(this.#algorithm, this.#key, iv);
        let encrypted = cipher.update(originStr, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + encrypted;
    };
}

module.exports = { Guardian };
