
const { createReadStream, createWriteStream } = require('fs');
const { createGzip, createGunzip, createDeflate, createInflate } = require('zlib');

const { promisify } = require('util');
const { pipeline } = require('stream');
const promisePipeline = promisify(pipeline);

class Archiver {
    #algorithm;

    constructor(options = { algorithm: 'gzip' }) {
        this.#checkConditions(options);
        this.#algorithm = options.algorithm;
    }

    async zipFile(input, output = input + '.gz') {
        const zipper = (this.#algorithm === 'gzip') ? createGzip() : createDeflate();
        const source = createReadStream(input);
        const destination = createWriteStream(output);
        await promisePipeline(source, zipper, destination);
        return 'Zip file succeeded';
    }

    async unzipFile(input, output = input + '.unz') {
        const unzip = (this.#algorithm === 'gzip') ? createGunzip() : createInflate();
        const source = createReadStream(input);
        const destination = createWriteStream(output);
        await promisePipeline(source, unzip, destination);
        return 'Unzip file succeeded';
    }

    #checkConditions = (options) => {
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

module.exports = { Archiver };
