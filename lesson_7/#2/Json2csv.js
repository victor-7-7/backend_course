
class Json2csv {
    #delimiter = ';';
    #firstObj = true;
    #csvColumnsCount = 0;

    transform(obj) {
        let header;
        // Первый объект будет предваряться шапкой
        if (this.#firstObj) {
            this.#csvColumnsCount = Object.keys(obj).length;
            header = this.#createCsvHeader(obj);
            this.#firstObj = false;
        }
        // Формируем из объекта строку csv-таблицы
        const line = this.#convertObjectToStringLine(obj, this.#csvColumnsCount);

        return header ? header + line : line;
    }

    #createCsvHeader = (object) => {
        let line = '';
        for (const key in object) {
            line += `"${key}"${this.#delimiter}`;
        }
        // Последний символ-разделитель меняем на символ новой строки
        return line.slice(0, -1) + '\n';
    }

    #convertObjectToStringLine = (object, csvColumnsCount) => {
        let line = '';
        let emptyLine = true;
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
        // Последний символ-разделитель меняем на символ новой строки
        return emptyLine ? '' : line.slice(0, -1) + '\n';
    }
}

module.exports = { Json2csv };
