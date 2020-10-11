
const { Readable } = require('stream');
const { Transform } = require('stream');
const { Writable } = require('stream');

//--------------------------------------------------------------------
class Ui extends Readable {

    constructor(customers) {
        super({objectMode: true});
        for (const customer of customers) {
            if(!('payload' in customer && typeof customer.payload === 'object'))
                throw new TypeError(
                'Объект пользователя должен содержать свойство payload. Это ' +
                'свойство должно быть объектом'
            );
            if(!('meta' in customer && typeof customer.meta === 'object'))
                throw new TypeError(
                    'Объект пользователя должен содержать свойство meta. Это ' +
                    'свойство должно быть объектом'
            );
            if(!('name' in customer.payload && typeof customer.payload.name === 'string'
                && customer.payload.name.length > 0)) throw new TypeError(
                'Объект пользователя payload должен содержать свойство name. Это ' +
                'свойство должно быть строковым литералом ненулевой длины'
            );
            if(!('email' in customer.payload && typeof customer.payload.email === 'string'
                && customer.payload.email.length > 0)) throw new TypeError(
                'Объект пользователя payload должен содержать свойство email. Это ' +
                'свойство должно быть строковым литералом ненулевой длины'
            );
            if(!('password' in customer.payload && typeof customer.payload.password === 'string'
                && customer.payload.password.length > 0)) throw new TypeError(
                'Объект пользователя payload должен содержать свойство password. Это ' +
                'свойство должно быть строковым литералом ненулевой длины'
            );
            if (Object.keys(customer.payload).length > 3) throw new Error(
                'Число свойств объекта пользователя payload должно быть 3'
            );
            if(!('algorithm' in customer.meta && typeof customer.meta.algorithm === 'string'
                && customer.meta.algorithm.length > 0)) throw new TypeError(
                'Объект пользователя meta должен содержать свойство algorithm. Это ' +
                'свойство должно быть строковым литералом ненулевой длины'
            );
            if(customer.meta.algorithm !== 'hex' && customer.meta.algorithm !== 'base64')
                throw new TypeError(
                'Значение свойства algorithm объекта meta должно быть либо hex, либо base64'
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

//--------------------------------------------------------------------
class Decryptor extends Transform {

    constructor() {
        super({readableObjectMode: true, writableObjectMode: true});
    }

    _transform(chunk, encoding, done) {
        chunk.payload.email = Decryptor.#transformHexToString(chunk.payload.email);
        chunk.payload.password = Decryptor.#transformHexToString(chunk.payload.password);
        this.push(chunk.payload);
        done();
    }

    static #transformHexToString = (hexStr) => {
        let str = '';
        let substr = '';
        for (let i = 0; i < hexStr.length; i += 2) {
            substr = '0x' + hexStr.substr(i, 2);
            str += String.fromCharCode(Number.parseInt(substr, 16));
        }
        return str;
    }
}

//--------------------------------------------------------------------
class AccountManager extends Writable {
    customers = [];

    constructor() {
        super({objectMode: true});
    }

    _write(chunk, encoding, done) {
        this.customers.push(chunk);
        console.log('=> Customer:', chunk);
        done();
    }
}

//=====================================================================
const customers = [
    {
        payload: {
            name: 'Pitter Black',
            email: '70626c61636b40656d61696c2e636f6d',
            password: '70626c61636b5f313233'
        },
        meta: {
            algorithm: 'hex'
        }
    },
    {
        payload: {
            name: 'Oliver White',
            email: '6f776869746540656d61696c2e636f6d',
            password: '6f77686974655f343536'
        },
        meta: {
            algorithm: 'base64'
        }
    }
];
const ui = new Ui(customers);
const decryptor = new Decryptor();
const manager = new AccountManager();

ui.pipe(decryptor).pipe(manager);

