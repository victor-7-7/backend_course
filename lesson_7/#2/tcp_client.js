
const { Socket } = require('net');
const { gunzip } = require('zlib');

const client = new Socket();

const objRequest = {
    filter: {
        name: {first: '', last: ''},
        phone: '',
        address: {zip: '', city:'', country: '', street: ''},
        email: ''
    },
    meta: {
        format: 'csv',
        archive: true
    }};

let content = '';

function clientConnect() {
    client.connect(8080, () => {
        console.log('Connected to server!');

        let jsonRequest;
        if (objRequest && typeof objRequest !== 'function') {
            jsonRequest = JSON.stringify(objRequest);
        } else {
            jsonRequest = '{}';
        }
        // Запрашиваем у сервера отфильтрованный контент
        client.write(jsonRequest);
    });
}

client.on('data', bufferChunk => {
    console.log('========== Received chunk on client side =>\n', bufferChunk);
    let raw = bufferChunk.toString();
    content += raw;
});

client.on('close', () => {
    console.log('Connection closed!');

    if (objRequest.meta.archive) {
        const zippedBuffer = Buffer.from(content, 'base64');

        gunzip(zippedBuffer, (err, unzippedBuff) => {
            if (err) {
                console.error('An unzip error occurred:', err);
            } else {
                content = unzippedBuff.toString();
                console.log('========== Summary: unzipped content =>\n', content);
            }
        });
    }
    else {
        console.log('========== Summary: plain content =>\n', content);
    }
});

client.on('error', err => {
    console.error('Error event (client side) =>', err);
});

module.exports = { clientConnect };

clientConnect();