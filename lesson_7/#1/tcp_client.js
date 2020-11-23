
const { Socket } = require('net');

const client = new Socket();

const objFilter = {name: {first: '', last: ''}, phone: '00',
    address: {zip: '', city: '', country: '', street: ''}, email: ''};

let objsArr = [];
let jsonContent = '';

function clientConnect() {
    client.connect(8080, () => {
        console.log('Connected to server!');

        let jsonFilter;
        if (objFilter && typeof objFilter !== 'function') {
            jsonFilter = JSON.stringify(objFilter);
        } else {
            jsonFilter = '{}';
        }
        // Запрашиваем у сервера отфильтрованный контент
        client.write(jsonFilter);
    });
}

client.on('data', data => {
    console.log('========== Received data chunk on client side =>\n', data.toString());
    jsonContent += data.toString();
});

client.on('close', () => {
    console.log('Connection closed!');
    try {
        objsArr = JSON.parse(jsonContent);
    } catch (e) {
        console.log('Server response is not a valid json');
    }
    // Из полученного массива объектов удаляем последний
    // элемент - служебный (пустая строка)
    objsArr.pop();
    console.log('========== Summary: we have got a object\'s array =>\n', objsArr);
    console.log('Total object\'s count:', objsArr.length);
});

client.on('error', err => {
    console.error('Error event (client side) =>', err);
});

module.exports = { clientConnect };

clientConnect();