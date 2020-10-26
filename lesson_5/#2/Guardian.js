
const { Transform } = require('stream');
const crypto = require('crypto');

const privateKey = '-----BEGIN RSA PRIVATE KEY-----\n' +
    'MIICWwIBAAKBgQC50ZjsOx4HMdSy3OOX+Ak6YQwqxh4EtxYwDhI6gZGzkcj0R2AJ\n' +
    'VLcrrOHGCSsVUOE8bOqHoDa9GuET/agPYQw0ing/62mC3xrIQC/uQR4k/mAswWrc\n' +
    'LrmGUfd7AH1nODpNuewpd73YwxlYQyu9RahdShpLMTzxAGfKGBzTm2KGlwIDAQAB\n' +
    'AoGAV0ei+7rc5OY8EPN+F8CSnRA+hczfBrn0uwew+jgn9t+QM2VfL6LSErq2pa1i\n' +
    'xjViRl6mXqQbcgGxHRG1IdwkvbAS/aoGBsaFRSYlT7xWbu+pjJO1sJBQKNo5tdap\n' +
    'xKIRs/s06o2bTvBO9XrjnFyuuMWLnxvKMl8toPyXHnspcGkCQQDiBNBgUmCvF2fi\n' +
    '1159XdNHzKtIHA+6b/dh98rRSP9yCC13e6ordgIUEYHnGy7oTd82ZcQEusOLjz6j\n' +
    'eoXRcVyTAkEA0nepnaNjphQ6WxSAjHz4wM87NRyy+SAkU/KMR6hoG7NzuPJ/02va\n' +
    'FHcRv1f5ZqrB5v5c4dWHwF/TA+5QZdb0bQJACf2ufGOH1JWTSQq+KYqJOWZJuAFN\n' +
    'jK9AXztF4uR4LkFASUTVK+CmjN6NQHsKIsi2ckAjXxYmaLfnS/Cxk6WQMwJAT0zA\n' +
    '/uFSKYBToH+wE77+pv8t6swebxl6Npsb2eANIerSfmv4V7u6Vp2qdTL7iIBsQNG0\n' +
    'Q28GECjKxB9l8Yk1XQJAd5UEYfA3IdTZV8OR4JtXNtgmgCYZhTUWdbfFbPOQ+jlx\n' +
    'oZ6ZiCpsipjf5SXqSJ+8Hd7ijTUP7/WGdaAsrcghfw==\n' +
    '-----END RSA PRIVATE KEY-----';

module.exports = class Guardian extends Transform {
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
        const sign = crypto.createSign('SHA256');
        sign.update(JSON.stringify(chunk));
        sign.end();
        const signature = sign.sign(privateKey);
        chunk.email = this.#encryptString(chunk.email);
        chunk.password = this.#encryptString(chunk.password);
        const modifiedChunk = {
            meta: {
                source: this.#rsName,
                signature: signature,
            },
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

