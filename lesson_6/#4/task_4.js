
const path = require('path');
const { Json2csv } = require('./Json2csv');
const { Archiver } = require('./Archiver');

const { writeFile } = require('fs');
const { promisify } = require('util');
const writeCsv = promisify(writeFile);

const converter = new Json2csv(['postId', 'name', 'body']);
const archiver = new Archiver({ algorithm: 'deflate' });

// Читаем json-файл и преобразуем его содержимое в csv-контент
converter.transform(path.join(__dirname, '../data/comments.json'))
    // Записываем контент в csv-файл
    .then(content => writeCsv(path.join(__dirname, '../data/comments.csv'), content))
    // Читаем csv-файл и через pipe перегоняем его в архивный файл с расширением .gz
    .then(() => archiver.zipFile(path.join(__dirname, '../data/comments.csv')))
    // Читаем gz-файл и через pipe перегоняем его в разархивированный файл с расширением .unz
    .then(message => {
        console.log(message);
        return  archiver.unzipFile(path.join(__dirname, '../data/comments.csv.gz'));
    }).then(message => console.log(message))
    .catch(reason => { console.error(reason); });
