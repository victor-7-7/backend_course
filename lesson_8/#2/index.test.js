
const { Bank } = require('./');

// there is a __mocks__ folder in the root project

const bank = new Bank();
const customer = { name: 'Oliver White', balance: 700 };
const personId = bank.register(customer);

describe('Test Bank class (index.js):', () => {

    test('check duplicated customer', () => {
        expect(() => bank.register(customer))
            .toThrow(`duplicated customer for name: '${customer.name}'`);
    });

    test('check funds amount', () => {
        expect(() => bank.emit('add', personId, 0))
            .toThrow('amount should be grater than 0');

        expect(() => bank.emit('add', personId, -50))
            .toThrow('amount should be grater than 0');
    });

    test('check credit for invalid customer', () => {
        expect(() => bank.emit('add', personId + 21, 50))
            .toThrow(`customer with id '${personId + 21}' not found`);
    });

});

// bank.register(customer); // Error: duplicated customer for name: 'Oliver White'
// bank.emit('add', personId, 0); // Error: amount should be grater than 0
// bank.emit('add', personId, -50); // Error: amount should be grater than 0
// bank.emit('add', 10000, 50); // Error: customer with id '10000' not found

