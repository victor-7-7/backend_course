const EventEmitter = require('events');

class Bank  extends EventEmitter {
    #customers = [];

    constructor() {
        super();
        this.on('add', (customerId, amount) => {
            if(typeof amount !== 'number' || amount <= 0)
                this.emit('error', 'Сумма зачисления должна быть числом больше 0');
            const customer = this.#findCustomer(customerId);
            if (customer) {
                customer.balance += amount;
            } else this.emit('error', 'В банке нет клиента с таким идентификатором');
        });
        this.on('get', (customerId, func) => {
            const customer = this.#findCustomer(customerId);
            if (customer) {
                func(customer.balance);
            } else this.emit('error', 'В банке нет клиента с таким идентификатором');
        });
        this.on('withdraw', (customerId, amount) => {
            if(typeof amount !== 'number' || amount <= 0)
                this.emit('error', 'Сумма списания должна быть числом больше 0');
            const customer = this.#findCustomer(customerId);
            if (customer) {
                if (customer.balance < amount)
                    this.emit('error', 'Сумма списания не должна превышать баланс на счете');
                customer.balance -= amount;
            } else this.emit('error', 'В банке нет клиента с таким идентификатором');
        });
        this.on('error', message => {
            throw new Error(message);
        })
    }

    register(customer) {
        if(!('name' in customer && typeof customer.name === 'string'
            && customer.name.length > 0)) throw new TypeError(
            'Клиент должен содержать свойство name. Это свойство ' +
            'должно быть строковым литералом ненулевой длины'
        );
        // Значение свойства name не должно совпадать со значениями
        // свойства name других клиентов в массиве
        let coincide = false;
        for(const element of this.#customers)  {
            if (customer.name === element.name) {
                coincide = true;
                break;
            }
        }
        if (coincide) throw new TypeError('В коллекции уже есть клиент ' +
            `со значением свойства name -> ${customer.name}`);

        if(!('balance' in customer && typeof customer.balance === 'number'))
            throw new TypeError('Клиент должен содержать свойство balance типа number');

        if(customer.balance <= 0)
            throw new TypeError('Баланс клиента не должен быть меньше или равным 0');

        customer.id = Symbol(customer.name);
        this.#customers.push(customer);
        return customer.id;
    }

    #findCustomer = (customerId) => {
        if (typeof customerId !== 'symbol') return null;
        for(const customer of this.#customers) {
            if (customer.id === customerId) {
                return customer;
            }
        }
        return null;
    }
}


const bank = new Bank();
const personId = bank.register({
                                   name: 'Pieter Black',
                                   balance: 100
                               });
bank.emit('add', personId, 20);
bank.emit('get', personId, (balance) => {
    console.log(`I have ${balance}₴`); // I have 120₴
});
bank.emit('withdraw', personId, 50);
bank.emit('get', personId, (balance) => {
    console.log(`I have ${balance}₴`); // I have 70₴
});

