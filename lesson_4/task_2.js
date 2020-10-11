
const { Readable } = require('stream');
const { Transform } = require('stream');
const { Writable } = require('stream');

class Ui extends Readable {

    constructor(customers) {
        super({objectMode: true});
        for (const customer of customers) {
            if(!('name' in customer && typeof customer.name === 'string'
                && customer.name.length > 0)) throw new TypeError(
                'Объект пользователя должен содержать свойство name. Это ' +
                'свойство должно быть строковым литералом ненулевой длины'
            );
            if(!('email' in customer && typeof customer.email === 'string'
                && customer.email.length > 0)) throw new TypeError(
                'Объект пользователя должен содержать свойство email. Это ' +
                'свойство должно быть строковым литералом ненулевой длины'
            );
            if(!('password' in customer && typeof customer.password === 'string'
                && customer.password.length > 0)) throw new TypeError(
                'Объект пользователя должен содержать свойство password. Это ' +
                'свойство должно быть строковым литералом ненулевой длины'
            );
            if (Object.keys(customer).length > 3) throw new Error(
                'Число свойств объекта пользователя должно быть 3'
            );
        }
        this.data = customers;
    }

    _read() {
        const data = this.data.shift();
        if (!data) {
            this.push(null);
        } else {
            this.push(data);
        }
    }
}

class Guardian extends Transform {
    #rsName;

    constructor() {
        super({readableObjectMode: true, writableObjectMode: true});
        this.on('pipe', (src) => {
            this.#rsName = src.constructor.name;
        })
    }

    _transform(chunk, encoding, done) {
        chunk.email = Guardian.#transformStringToHexView(chunk.email);
        chunk.password = Guardian.#transformStringToHexView(chunk.password);
        this.push({
                      meta: {source: this.#rsName},
                      payload: chunk,
                  });
        done();
    }

    static #transformStringToHexView = (originStr) => {
        let hexStr = '';
        for (let i = 0; i < originStr.length; i++) {
            hexStr += originStr.charCodeAt(i).toString(16);
        }
        return hexStr;
    }
}

class AccountManager extends Writable {
    customers = [];

    constructor() {
        super({objectMode: true});
    }

    _write(chunk, encoding, done) {
        this.customers.push(chunk);
        console.log('=> Payload:', chunk.payload);
        done();
    }
}

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
const guardian = new Guardian();
const manager = new AccountManager();

ui.pipe(guardian).pipe(manager);

