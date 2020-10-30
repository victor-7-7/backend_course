const fs = require('fs');
const path = require('path');

class Json2csv {
    #delimiter = ';';

    transform = (jsonSourcePath, csvDestinationPath) => {

        fs.readFile(jsonSourcePath, (error, file) => {
            if (error) throw error;

            let arrayOfObjects;

            try {
                arrayOfObjects = JSON.parse(file.toString());
            } catch (e) {
                console.log(`Содержимое файла ${jsonSourcePath} не является Json-объектом`);
                return;
            }

            if (!Array.isArray(arrayOfObjects)) {
                // Нет смысла перегонять json в cvs ради единственной записи
                console.log('Json-объект должен быть массивом');
                return;
            }

            const cvsColumnsCount = Object.keys(arrayOfObjects[0]).length;
            if (cvsColumnsCount === 0) {
                console.log('Элемент массива должен быть объектом со свойствами');
                return;
            }

            // Формируем шапку cvs-таблицы
            let content = this.#convertObjectToStringLine(
                arrayOfObjects[0], cvsColumnsCount, true);
            // Заполняем cvs-таблицу строками
            for (const object of arrayOfObjects) {
                content += this.#convertObjectToStringLine(object, cvsColumnsCount);
            }
            // Пишем сформированную cvs-таблицу в файл
            fs.writeFile(csvDestinationPath, content, error => {
                if (error) throw error;
            });
        });
    }

    #convertObjectToStringLine = (object, cvsColumnsCount, header = false) => {
        // Число полей в формируемой строке должно совпасть с числом столбцов в таблице.
        // Иначе невалидный объект отбрасывается
        if (Object.keys(object).length !== cvsColumnsCount) return '';
        let i = 0;
        let line = '';
        // Все свойства объекта являются OwnProperty в силу специфики создания объекта
        for (const key in object) {
            i++;
            const cell = header ? key : object[key];
            // Неэкранированной двойной кавычки внутри cell быть не может
            // (это сломало бы JSON.parse())
            line += (i === cvsColumnsCount) ? `"${cell}"\n` : `"${cell}"${this.#delimiter}`;
        }
        return line;
    }
}
 //=======================================================================

new Json2csv().transform(
    path.join(__dirname, '/data/comments.json'),
    path.join(__dirname, '/data/comments.csv')
);


