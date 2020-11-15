
const { createReadStream, createWriteStream } = require('fs');
const { createGzip, createGunzip } = require('zlib');

const { promisify } = require('util');
const { pipeline } = require('stream');
const promisePipeline = promisify(pipeline);

class Archiver {

    async zipFile(input, output = input + '.gz') {
        const gzip = createGzip();
        const source = createReadStream(input);
        const destination = createWriteStream(output);
        await promisePipeline(source, gzip, destination);
        return 'Zip file succeeded';
    }

    async unzipFile(input, output = input + '.unz') {
        const gunzip = createGunzip();
        const source = createReadStream(input);
        const destination = createWriteStream(output);
        await promisePipeline(source, gunzip, destination);
        return 'Unzip file succeeded';
    }
}

module.exports = { Archiver };
