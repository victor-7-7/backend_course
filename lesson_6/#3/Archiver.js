
const fs = require('fs');
const zlib = require('zlib');
const { pipeline } = require('stream');

module.exports = class Archiver {

    zipFile(sourcePath, destinationPath = sourcePath + '.gz') {
        return new Promise((resolve, reject) => {
            const reader = fs.createReadStream(sourcePath);
            const gzip = zlib.createGzip(); // архиватор
            const writer = fs.createWriteStream(destinationPath);
            pipeline(reader, gzip, writer,
                     (err) => {
                         if (err) {
                             reject('Zip pipeline failed. ' + err);
                         } else {
                             resolve('Zip pipeline succeeded');
                         }
                     });
        });
    }

    unzipFile(sourcePath, destinationPath = sourcePath + '.unz') {
        const reader = fs.createReadStream(sourcePath);
        const gunzip = zlib.createGunzip(); // деархиватор
        const writer = fs.createWriteStream(destinationPath);
        pipeline(reader, gunzip, writer,
                 (err) => {
                     if (err) {
                         console.error('Unzip pipeline failed. ', err);
                     } else {
                         console.log('Unzip pipeline succeeded');
                     }
                 });

    }
}

