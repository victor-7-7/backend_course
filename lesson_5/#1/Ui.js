
const { Readable } = require('stream');

module.exports = class Ui extends Readable {

    constructor(customers, options = {objectMode: true}) {
        super(options);
        Ui.#checkConditions(customers);
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

    static #checkConditions = (customers) => {
        for (const customer of customers) {
            if(!(customer.hasOwnProperty('name') && typeof customer.name === 'string'
                && customer.name.length > 0)) throw new TypeError(
                'Объект пользователя должен содержать свойство name. Это ' +
                'свойство должно быть строковым литералом ненулевой длины'
            );
            if(!(customer.hasOwnProperty('email') && typeof customer.email === 'string'
                && customer.email.length > 0)) throw new TypeError(
                'Объект пользователя должен содержать свойство email. Это ' +
                'свойство должно быть строковым литералом ненулевой длины'
            );
            if(!(customer.hasOwnProperty('password') && typeof customer.password === 'string'
                && customer.password.length > 0)) throw new TypeError(
                'Объект пользователя должен содержать свойство password. Это ' +
                'свойство должно быть строковым литералом ненулевой длины'
            );
            if (Object.keys(customer).length > 3) throw new Error(
                'Число свойств объекта пользователя должно быть 3'
            );
        }
    }
}

