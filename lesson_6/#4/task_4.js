
const path = require('path');
const Json2csv = require('./Json2csv');
const Archiver = require('./Archiver');

// ['postId', 'name', 'body']
const converter = new Json2csv(['postId', 'name', 'body']);
const archiver = new Archiver({ algorithm: 'deflate' });

converter.transform(
    path.join(__dirname, '../data/comments.json'),
    path.join(__dirname, '../data/comments.csv')
).then(() => {
    return archiver.zipFile(path.join(__dirname, '../data/comments.csv'));
}).then(message => {
    console.log(message);
    archiver.unzipFile(path.join(__dirname, '../data/comments.csv.gz'));
}).catch(reason => { console.log(reason); });


