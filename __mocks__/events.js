
// https://jestjs.io/docs/ru/manual-mocks
// If the module you are mocking is a Node module, the mock should be placed
// in the __mocks__ directory adjacent to node_modules. Then there's
// no need to explicitly call jest.mock('module_name'). Otherwise, you must call

const EventEmitter = jest.createMockFromModule('events');
let realPersonId;

EventEmitter.emit = (eventName, ...args) => {
    if (eventName === 'error') {
        throw new Error(args[0].message);
    }
    else if (eventName === 'add') {
        if (!realPersonId) realPersonId = args[0];

        // Если сумма зачисления на счет не положительна
        if (args[1] <= 0) {
            throw new Error('amount should be grater than 0');
        }
        // Если указан неверный идентификатор клиента банка
        if (args[0] !== realPersonId) {
            throw new Error(`customer with id '${args[0]}' not found`);
        }
    }
};

module.exports = { EventEmitter };
