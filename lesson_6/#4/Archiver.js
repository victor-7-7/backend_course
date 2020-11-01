
const fs = require('fs');
const zlib = require('zlib');
const { pipeline } = require('stream');

module.exports = class Archiver {
    #algorithm;

    constructor(options = { algorithm: 'gzip' }) {
        Archiver.#checkConditions(options);
        this.#algorithm = options.algorithm;
    }

    zipFile(sourcePath, destinationPath = sourcePath + '.gz') {
        return new Promise((resolve, reject) => {
            const reader = fs.createReadStream(sourcePath);
            // архиватор
            const zipper = (this.#algorithm === 'gzip') ? zlib.createGzip()
                : zlib.createDeflate();

            const writer = fs.createWriteStream(destinationPath);
            pipeline(reader, zipper, writer,
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
        // деархиватор
        const unzip = (this.#algorithm === 'gzip') ? zlib.createGunzip()
            : zlib.createInflate();

        const writer = fs.createWriteStream(destinationPath);
        pipeline(reader, unzip, writer,
             (err) => {
                 if (err) {
                     console.error('Unzip pipeline failed. ', err);
                 } else {
                     console.log('Unzip pipeline succeeded');
                 }
             });
    }

    static #checkConditions = (options) => {
        if(!(options.hasOwnProperty('algorithm') && typeof options.algorithm === 'string'))
            throw new TypeError(
                'Объект опций должен содержать свойство algorithm. Это ' +
                'свойство должно быть строковым литералом'
            );
        if(options.algorithm !== 'gzip' && options.algorithm !== 'deflate')
            throw new TypeError(
                'Значение свойства algorithm объекта опций должно быть либо gzip, либо deflate'
            );
        if (Object.keys(options).length > 1) throw new Error(
            'В объекте опций должно быть единственное свойство (algorithm)'
        );
    }
}

