
const { createServer } = require('net');
const { join } = require('path');
const { createReadStream } = require('fs');
const { gzip } = require('zlib');
const oboe = require('oboe');

const { Json2csv } = require('./Json2csv');

const server = createServer();
const PORT = process.env.PORT || 8080;

server.on('connection', socket => {
    console.log('New client connected!');

    socket.on('data', jsonRequest => {
        let pattern = {};
        let content = '';

        const objRequest = jsonRequest.toString() !== '{}' ? JSON.parse(jsonRequest) : null;

        if (objRequest) {
            checkRequest(objRequest, pattern);
        }

        const rs = createReadStream(join(__dirname, '../users.json'));
        const formatter = new Json2csv();
        let ended = false;

        oboe(rs)
        .node('!.*', function (obj) {
            // obj -> очередной JS объект, извлеченный из потока rs (после парсинга).
            // Если фильтра нет, либо есть, но obj соответствует поисковому паттерну
            if (Object.keys(pattern).length === 0 || checkObjectByPattern(obj, pattern)) {
                // Если надо отформатировать в csv текст
                if (objRequest.meta.format) {
                    const line = formatter.transform(obj);
                    content += line;
                }
                // Без форматирования
                else {
                    content += JSON.stringify(obj);
                }
                // Чтобы не накапливать объекты в памяти на стороне сервера
                return oboe.drop();
            }
        })
        .done(function(){
            console.log(">>>>>>> On server side: all stream parsing done!");

            // Если надо сжать контент
            if (objRequest.meta.archive) {
                console.log('>>>>>>> Content length before zip ==>', content.length);

                gzip(content, (err, buffer) => {
                    if (err) {
                        console.error('A zip error occurred:', err);
                    } else {
                        content = buffer.toString('base64');
                        console.log('>>>>>>> Content length after zip ==>', content.length);
                        console.log('>>>>>>> Build zipped response on server side ==>\n', content);
                        // Отправляем отфильтрованный сжатый контент клиенту
                        socket.write(content);
                        socket.end();
                    }
                });
            }
            else {
                console.log('>>>>>>> Build plain response on server side ==>\n', content);
                // Отправляем отфильтрованный не сжатый контент клиенту
                socket.write(content);
                socket.end();
            }
        })
        .fail(function(){
            // При ошибке парсинга json-стрима
            if (!ended) {
                console.log(">>>>>>> On server side: fail to parse json file", rs.path);
                // Отправляем отфильтрованный несжатый частично
                // извлеченный из ресурса контент клиенту
                socket.write(content);
                socket.end();
                ended = true;
            }
        });
    });

    socket.on('end', () => {
        console.log('Client is disconnected!');
    });
});

server.on('listening', () => {
    const { port } = server.address();
    console.log(`TCP Server started on port ${port}!`);
});


function checkRequest(objRequest, pattern) {
    if (typeof objRequest !== 'object' || Array.isArray(objRequest)) {
        throw TypeError('Клиентский запрос должен быть объектом и при этом не массивом');
    }

    if (!(objRequest.hasOwnProperty('filter') && objRequest.hasOwnProperty('meta'))
        || Object.keys(objRequest).length > 2) {
        throw Error('Объект клиентского запроса должен содержать только два свойства: filter и meta');
    }

    checkMeta(objRequest);

    const filter = objRequest['filter'];
    checkFilter(filter);

    assembleSearchPattern(filter, pattern);
}

// Проверяем свойство meta на валидность
function checkMeta(objRequest) {
    if (typeof objRequest.meta !== 'object' || Array.isArray(objRequest.meta)) {
        throw TypeError('Свойство meta клиентского запроса должно быть объектом и при этом не массивом');
    }

    if (objRequest.meta.hasOwnProperty('format')) {
        if (typeof objRequest.meta.format !== 'string' || objRequest.meta.format !== 'csv') {
            throw Error('Свойство format объекта meta должно иметь строковое значение csv');
        }
    }

    if (objRequest.meta.hasOwnProperty('archive')) {
        if (typeof objRequest.meta.archive !== 'boolean') {
            throw Error('Свойство archive объекта meta должно иметь тип boolean');
        }
    }
}

// Проверяем свойство filter на валидность структуры
function checkFilter(filter) {
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
}

// Составляем поисковый паттерн
function assembleSearchPattern(filter, pattern) {
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