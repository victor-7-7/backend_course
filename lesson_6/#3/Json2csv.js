
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

class Json2csv {
    #delimiter = ';';
    #filter;

    constructor(propertyFilter) {
        if (propertyFilter && Array.isArray(propertyFilter)
            && propertyFilter.length > 0) {
            this.#filter = this.#cleanArray(propertyFilter);
        }
    }

    async transform(jsonSourcePath) {

        const file = await readFile(jsonSourcePath);

        const arrayOfObjects = this.#getObjects(file, jsonSourcePath);

        // Если свойства объекта надо фильтровать, то число столбцов
        // в создаваемой таблице приравняем длине фильтр-массива
        const csvColumnsCount = this.#filter ? this.#filter.length
            : Object.keys(arrayOfObjects[0]).length;

        if (csvColumnsCount === 0) {
            throw 'Элемент массива должен быть объектом со свойствами';
        }

        // Формируем шапку csv-таблицы
        const header = this.#createCsvHeader(arrayOfObjects[0]);

        if (!header) {
            throw 'Шапка csv-таблицы не должна быть пустой';
        }

        let body = '';
        // Формируем тело csv-таблицы
        let csvRowsCount = 0;
        for (const object of arrayOfObjects) {
            const line = this.#convertObjectToStringLine(object, csvColumnsCount);
            if (line !== '') {
                body += line;
                csvRowsCount++;
            }
        }

        if (csvRowsCount === 0) {
            throw 'Результат преобразования json -> csv не имеет содержательной части';
        }

        return header + body;
    }

    #cleanArray = (array) => {
        const cleanedArr = array.filter(value => typeof value === 'string' && value.trim() !== '');
        return cleanedArr.length > 0 ? cleanedArr : null;
    }

    #getObjects = (file, path) => {
        let objs;
        try {
            objs = JSON.parse(file.toString());
        } catch (e) {
            throw `Содержимое файла ${path} не является Json-объектом`;
        }

        if (!Array.isArray(objs)) {
            // Нет смысла перегонять json в csv ради единственной csv-записи
            throw `Json-объект должен быть массивом`;
        }
        return objs;
    }

    #createCsvHeader = (object) => {
        let line = '';
        // Если в конструктор был передан фильтр-массив на имена свойств
        if (this.#filter) {
            for (const value of this.#filter) {
                line += `"${value}"${this.#delimiter}`;
            }
        }
        // Без фильтра на имена свойств
        else {
            for (const key in object) {
                line += `"${key}"${this.#delimiter}`;
            }
        }
        // Последний символ-разделитель меняем на символ новой строки
        return line.slice(0, -1) + '\n';
    }

    #convertObjectToStringLine = (object, csvColumnsCount) => {
        let line = '';
        let emptyLine = true;
        // Если в конструктор был передан фильтр-массив на имена свойств
        if (this.#filter) {
            // Формируем строку из значений фильтрованных свойств объекта
            for (let i = 0; i < csvColumnsCount; i++) {
                const key = this.#filter[i];
                const value = Object.keys(object).includes(key) ? object[key] : '';
                line += `"${value}"${this.#delimiter}`;
                if (value !== '') emptyLine = false;
            }
        }
        // Без фильтра на имена свойств
        else {
            // Число полей в формируемой строке должно совпасть с числом столбцов в таблице.
            // Иначе невалидный объект отбрасывается
            if (Object.keys(object).length !== csvColumnsCount) {
                return '';
            }
            // Все свойства объекта являются OwnProperty в силу специфики создания объекта
            for (const key in object) {
                // Неэкранированной двойной кавычки внутри object[key] быть не может
                // (это сломало бы JSON.parse())
                line += `"${object[key]}"${this.#delimiter}`;
                if (object[key] !== '') emptyLine = false;
            }
        }
        // Последний символ-разделитель меняем на символ новой строки
        return emptyLine ? '' : line.slice(0, -1) + '\n';
    }
}

module.exports = { Json2csv };
