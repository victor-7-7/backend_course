
const { validate, validateFields } = require('./');

describe('Test validate expr (index.js):', () => {

    test('validate payload is an object', () => {
        const data = {payload: 'a', meta: true};
        const name = 'Bob';
        expect(() => validate({ data, name }))
            .toThrow(`${name}: payload should be an object`);
    });

    test('validate payload.name exists', () => {
        const data = {payload: {}, meta: true};
        const name = 'Bob';
        expect(() => validate({ data, name }))
            .toThrow(`${name}: payload should have required field name`);
    });

    test('validate payload.name is not empty', () => {
        const data = {payload: {name: ''}, meta: true};
        const name = 'Bob';
        expect(() => validate({ data, name }))
            .toThrow(`${name}: payload.name should not be empty`);
    });

    test('validate payload.name is a string', () => {
        const data = {payload: {name: []}, meta: true};
        const name = 'Bob';
        expect(() => validate({ data, name }))
            .toThrow(`${name}: payload.name should be a string`);
    });

    test('validate payload.email exists', () => {
        const data = {payload: {name: 'xx'}, meta: true};
        const name = 'Bob';
        expect(() => validate({ data, name }))
            .toThrow(`${name}: payload should have required field email`);
    });

    test('validate payload.email is not empty', () => {
        const data = {payload: {name: 'xx', email: ''}, meta: true};
        const name = 'Bob';
        expect(() => validate({ data, name }))
            .toThrow(`${name}: payload.email should not be empty`);
    });

    test('validate payload.email is a string', () => {
        const data = {payload: {name: 'xx', email: []}, meta: true};
        const name = 'Bob';
        expect(() => validate({ data, name }))
            .toThrow(`${name}: payload.email should be a string`);
    });

    test('validate payload.password exists', () => {
        const data = {payload: {name: 'xx', email: 'xx'}, meta: true};
        const name = 'Bob';
        expect(() => validate({ data, name }))
            .toThrow(`${name}: payload should have required field password`);
    });

    test('validate payload.password is not empty', () => {
        const data = {payload: {name: 'xx', email: 'xx', password: ''}, meta: true};
        const name = 'Bob';
        expect(() => validate({ data, name }))
            .toThrow(`${name}: payload.password should not be empty`);
    });

    test('validate payload.password is a string', () => {
        const data = {payload: {name: 'xx', email: 'xx', password: []}, meta: true};
        const name = 'Bob';
        expect(() => validate({ data, name }))
            .toThrow(`${name}: payload.password should be a string`);
    });
});


describe('Test validateFields expr (index.js):', () => {

    test('validate payload field', () => {
        const data = {
            stub: {name: 'xx', email: 'xx', password: 'xx'},
            meta: {source: 'xx', algorithm: 'xx'}
        };
        const name = 'Bob';
        expect(() => validateFields({ data, name }))
            .toThrow(`${name}: data contains not allowed field — stub`);
    });

    test('validate name field', () => {
        const data = {
            payload: {stub: 'xx', email: 'xx', password: 'xx'},
            meta: {source: 'xx', algorithm: 'xx'}
        };
        const name = 'Bob';
        expect(() => validateFields({ data, name }))
            .toThrow(`${name}: data contains not allowed field — stub`);
    });

    test('validate email field', () => {
        const data = {
            payload: {name: 'xx', stub: 'xx', password: 'xx'},
            meta: {source: 'xx', algorithm: 'xx'}
        };
        const name = 'Bob';
        expect(() => validateFields({ data, name }))
            .toThrow(`${name}: data contains not allowed field — stub`);
    });

    test('validate password field', () => {
        const data = {
            payload: {name: 'xx', email: 'xx', stub: 'xx'},
            meta: {source: 'xx', algorithm: 'xx'}
        };
        const name = 'Bob';
        expect(() => validateFields({ data, name }))
            .toThrow(`${name}: data contains not allowed field — stub`);
    });

    test('validate meta field', () => {
        const data = {
            payload: {name: 'xx', email: 'xx', password: 'xx'},
            stub: {source: 'xx', algorithm: 'xx'}
        };
        const name = 'Bob';
        expect(() => validateFields({ data, name }))
            .toThrow(`${name}: data contains not allowed field — stub`);
    });

    test('validate source field', () => {
        const data = {
            payload: {name: 'xx', email: 'xx', password: 'xx'},
            meta: {stub: 'xx', algorithm: 'xx'}
        };
        const name = 'Bob';
        expect(() => validateFields({ data, name }))
            .toThrow(`${name}: data contains not allowed field — stub`);
    });

    test('validate algorithm field', () => {
        const data = {
            payload: {name: 'xx', email: 'xx', password: 'xx'},
            meta: {source: 'xx', stub: 'xx'}
        };
        const name = 'Bob';
        expect(() => validateFields({ data, name }))
            .toThrow(`${name}: data contains not allowed field — stub`);
    });

});



