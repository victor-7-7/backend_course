
const { createServer } = require('net');
const { createReadStream } = require('fs');
const { join } = require('path');
const oboe = require('oboe'); // Требуется установка модуля (npm install oboe)

const server = createServer();
const PORT = process.env.PORT || 8080;

server.on('connection', socket => {
    console.log('New client connected!');

    socket.on('data', jsonFilter => {
        let pattern = {};

        const objFilter = jsonFilter.toString() !== '{}' ? JSON.parse(jsonFilter) : null;

        if (objFilter) {
            checkFilter(objFilter, pattern);
        }

        const rs = createReadStream(join(__dirname, '../users.json'));

        // Открывающий токен для json-массива, формирующегося на клиентской стороне
        socket.write('[');
        let ended = false;

        oboe(rs).node('!.*', function (obj) {
            // obj -> очередной JS объект, извлеченный из потока rs (после парсинга).
            // Если фильтра нет, либо есть, но obj соответствует поисковому паттерну
            if (!objFilter || checkObjectByPattern(obj, pattern)) {
                // То отправляем obj клиенту (запятая нужна для построения
                // правильного json-массива на стороне клиента)
                socket.write(JSON.stringify(obj) + ',');
                // Чтобы не накапливать объекты в памяти на стороне сервера
                return oboe.drop();
            }
        })
        .done(function(){
            finish(socket);
            console.log(">>>>>>> On server side: all stream parsing done!");
        })
        .fail(function(){
            // При ошибке парсинга json-стрима данный колбэк вызывается
            // дважды. Проверяем ended, чтобы предотвратить двойное исполнение
            if (!ended) {
                finish(socket);
                console.log(">>>>>>> On server side: fail to parse json file", rs.path);
                ended = true;
            }
        });
    });

    socket.on('end', () => {
        console.log('Client is disconnected!');
    });
});

function finish(socket) {
    // Пишем закрывающий токен для json-массива, формирующегося на клиентской стороне
    socket.write('\"\"]');
    socket.end();
}

server.on('listening', () => {
    const { port } = server.address();
    console.log(`TCP Server started on port ${port}!`);
});

function checkFilter(filter, pattern) {
    if (typeof filter !== 'object' || Array.isArray(filter)) {
        throw TypeError('Фильтр должен быть объектом и при этом не массивом');
    }

    for (const key of Object.keys(filter)) {
        if (key !== 'name' && key !== 'phone' && key !== 'address' && key !== 'email') {
            throw Error(`Фильтр содержит недопустимое свойство ${key}`);
        }
        if ((key === 'phone' || key === 'email') && typeof filter[key] !== 'string') {
            throw Error(`Значение свойства ${key} должно быть строкой`);
        }
        if ((key === 'name' || key === 'address') && (typeof filter[key] !== 'object'
        || Object.keys(filter[key]).length === 0)) {
            throw Error(`Значение свойства ${key} должно быть не пустым объектом`);
        }
    }

    if (filter.hasOwnProperty('phone')) {
        pattern.phone = filter.phone;
    }

    if (filter.hasOwnProperty('email')) {
        pattern.email = filter.email;
    }

    if (filter.hasOwnProperty('name')) {
        for (const key of Object.keys(filter.name)) {
            if (key !== 'first' && key !== 'last') {
                throw Error(`Объект name фильтра содержит недопустимое свойство ${key}`);
            }
            if (typeof filter.name[key] !== 'string') {
                throw Error(`Значение свойства ${key} объекта name должно быть строкой`);
            }
        }
        if (filter.name.hasOwnProperty('first')) {
            pattern.nameFirst = filter.name.first;
        }

        if (filter.name.hasOwnProperty('last')) {
            pattern.nameLast = filter.name.last;
        }
    }

    if (filter.hasOwnProperty('address')) {
        for (const key of Object.keys(filter.address)) {
            if (key !== 'zip' && key !== 'city' && key !== 'country' && key !== 'street') {
                throw Error(`Объект address фильтра содержит недопустимое свойство ${key}`);
            }
            if (typeof filter.address[key] !== 'string') {
                throw Error(`Значение свойства ${key} объекта address должно быть строкой`);
            }
        }
        if (filter.address.hasOwnProperty('zip')) {
            pattern.addressZip = filter.address.zip;
        }

        if (filter.address.hasOwnProperty('city')) {
            pattern.addressCity = filter.address.city;
        }

        if (filter.address.hasOwnProperty('country')) {
            pattern.addressCountry = filter.address.country;
        }

        if (filter.address.hasOwnProperty('street')) {
            pattern.addressStreet = filter.address.street;
        }
    }
}

/** nameFirst, nameLast, phone, addressZip, addressCity, addressCountry, addressStreet, email */
function checkObjectByPattern(obj, pattern) {
    if (pattern.nameFirst) {
        if (!obj.name.hasOwnProperty('first') || typeof obj.name.first !== 'string') {
            return false;
        }
        // без new (factory notation)
        if (!RegExp(pattern.nameFirst).test(obj.name.first)) {
            return false;
        }
    }

    if (pattern.nameLast) {
        if (!obj.name.hasOwnProperty('last') || typeof obj.name.last !== 'string') {
            return false;
        }
        if (!RegExp(pattern.nameLast).test(obj.name.last)) {
            return false;
        }
    }

    if (pattern.phone) {
        if (!obj.hasOwnProperty('phone') || typeof obj.phone !== 'string') {
            return false;
        }
        if (!RegExp(pattern.phone).test(obj.phone)) {
            return false;
        }
    }

    if (pattern.addressZip) {
        if (!obj.address.hasOwnProperty('zip') || typeof obj.address.zip !== 'string') {
            return false;
        }
        if (!RegExp(pattern.addressZip).test(obj.address.zip)) {
            return false;
        }
    }

    if (pattern.addressCity) {
        if (!obj.address.hasOwnProperty('city') || typeof obj.address.city !== 'string') {
            return false;
        }
        if (!RegExp(pattern.addressCity).test(obj.address.city)) {
            return false;
        }
    }

    if (pattern.addressCountry) {
        if (!obj.address.hasOwnProperty('country') || typeof obj.address.country !== 'string') {
            return false;
        }
        if (!RegExp(pattern.addressCountry).test(obj.address.country)) {
            return false;
        }
    }

    if (pattern.addressStreet) {
        if (!obj.address.hasOwnProperty('street') || typeof obj.address.street !== 'string') {
            return false;
        }
        if (!RegExp(pattern.addressStreet).test(obj.address.street)) {
            return false;
        }
    }

    if (pattern.email) {
        if (!obj.hasOwnProperty('email') || typeof obj.email !== 'string') {
            return false;
        }
        if (!RegExp(pattern.email).test(obj.email)) {
            return false;
        }
    }
    return true;
}

function serverStart() {
    server.listen(PORT);
}

module.exports = { serverStart }

serverStart();