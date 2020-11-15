const fs = require('fs');
const path = require('path');

class Json2csv {
    #delimiter = ';';

    transform = (jsonSourcePath, csvDestinationPath) => {

        fs.readFile(jsonSourcePath, (error, file) => {
            if (error) {
                throw error;
            }

            const arrayOfObjects = this.#getObjects(file, jsonSourcePath);
            if (! arrayOfObjects) {
                return;
            }

            const csvColumnsCount = Object.keys(arrayOfObjects[0]).length;
            if (csvColumnsCount === 0) {
                console.log('Элемент массива должен быть объектом со свойствами');
                return;
            }

            // Формируем шапку csv-таблицы
            const header = this.#createCsvHeader(arrayOfObjects[0]);

            let body = '';
            // Формируем тело csv-таблицы
            for (const object of arrayOfObjects) {
                body += this.#convertObjectToStringLine(object, csvColumnsCount);
            }
            // Пишем сформированную csv-таблицу в файл
            fs.writeFile(csvDestinationPath, header + body, error => {
                if (error) {
                    throw error;
                }
            });
        });
    }

    #getObjects = (file, path) => {
        let objs;
        try {
            objs = JSON.parse(file.toString());
        } catch (e) {
            console.log(`Содержимое файла ${path} не является Json-объектом`);
            return null;
        }

        if (!Array.isArray(objs)) {
            // Нет смысла перегонять json в csv ради единственной записи
            console.log('Json-объект должен быть массивом');
            return null;
        }
        return objs;
    }

    #createCsvHeader = (object) => {
        let line = '';
        for (const key in object) {
            line += `"${key}"${this.#delimiter}`;
        }
        // Меняем последний символ-разделитель на символ новой строки
        return line.slice(0, -1) + '\n';
    }

    #convertObjectToStringLine = (object, csvColumnsCount) => {
        // Число полей в формируемой строке должно совпасть с числом столбцов в таблице.
        // Иначе невалидный объект отбрасывается
        if (Object.keys(object).length !== csvColumnsCount) {
            return '';
        }
        let line = '';
        // Все свойства объекта являются OwnProperty в силу специфики создания объекта
        for (const key in object) {
            // Неэкранированной двойной кавычки внутри value быть не может
            // (это сломало бы JSON.parse())
            line += `"${object[key]}"${this.#delimiter}`;
        }
        // Меняем последний символ-разделитель на символ новой строки
        return line.slice(0, -1) + '\n';
    }
}
 //=======================================================================

new Json2csv().transform(
    path.join(__dirname, '/data/comments.json'),
    path.join(__dirname, '/data/comments.csv')
);


