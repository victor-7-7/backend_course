
const fs = require('fs');

module.exports = class Json2csv {
    #delimiter = ';';
    #filter;

    constructor(propertyFilter) {
        if (propertyFilter && Array.isArray(propertyFilter)
            && propertyFilter.length > 0) {
            this.#filter = propertyFilter;
        }
    }

    transform(jsonSourcePath, csvDestinationPath) {
        return new Promise((resolve, reject) => {
            fs.readFile(jsonSourcePath, (error, file) => {
                if (error) {
                    reject(error);
                    return;
                }

                let arrayOfObjects;

                try {
                    arrayOfObjects = JSON.parse(file.toString());
                } catch (error) {
                    console.log(`Содержимое файла ${jsonSourcePath} не является Json-объектом`);
                    reject(error);
                    return;
                }

                if (!Array.isArray(arrayOfObjects)) {
                    // Нет смысла перегонять json в cvs ради единственной записи
                    reject('Json-объект должен быть массивом');
                    return;
                }
                // Если свойства объекта должны фильтроваться, то число столбцов
                // в создаваемой таблице приравняем длине фильтр-массива
                const cvsColumnsCount = this.#filter ? this.#filter.length
                    : Object.keys(arrayOfObjects[0]).length;

                if (cvsColumnsCount === 0) {
                    reject('Элемент массива должен быть объектом со свойствами');
                    return;
                }

                // Формируем шапку cvs-таблицы
                let content = this.#convertObjectToStringLine(
                    arrayOfObjects[0], cvsColumnsCount, true);

                if (!content) {
                    reject('Шапка cvs-таблицы не должна быть пустой');
                    return;
                }

                // Заполняем cvs-таблицу строками
                let cvsRowsCount = 0;
                for (const object of arrayOfObjects) {
                    const line = this.#convertObjectToStringLine(object, cvsColumnsCount);
                    if (line !== '') {
                        content += line;
                        cvsRowsCount++;
                    }
                }

                if (cvsRowsCount === 0) {
                    reject('Результат преобразования json -> cvs не имеет содержательной части');
                    return;
                }
                // Пишем сформированную cvs-таблицу в файл
                fs.writeFile(csvDestinationPath, content, error => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve();
                });
            });
        });
    }

    #convertObjectToStringLine = (object, cvsColumnsCount, header = false) => {
        let line = '';
        let notEmpty = false;
        // Если в конструктор был передан фильтр-массив на имена свойств
        if (this.#filter) {
            if (header) {
                // Формируем шапку таблицы из значений фильтр-массива
                let i = 0;
                for (const value of this.#filter) {
                    i++;
                    line += (i === cvsColumnsCount) ? `"${value}"\n` : `"${value}"${this.#delimiter}`;
                    if (value !== '') notEmpty = true;
                }
            }
            else {
                // Формируем тело таблицы из значений фильтрованных свойств объекта
                for (let i = 0; i < cvsColumnsCount; i++) {
                    const key = this.#filter[i];
                    const cell = Object.keys(object).includes(key) ? object[key] : '';
                    line += (i + 1 === cvsColumnsCount) ? `"${cell}"\n`
                        : `"${cell}"${this.#delimiter}`;
                    if (cell !== '') notEmpty = true;
                }
            }
        }
        // Без фильтра на имена свойств
        else {
            // Число полей в формируемой строке должно совпасть с числом столбцов в таблице.
            // Иначе невалидный объект отбрасывается
            if (Object.keys(object).length !== cvsColumnsCount) {
                return '';
            }
            let i = 0;
            // Все свойства объекта являются OwnProperty в силу специфики создания объекта
            for (const key in object) {
                i++;
                const cell = header ? key : object[key];
                // Неэкранированной двойной кавычки внутри cell быть не может
                // (это сломало бы JSON.parse())
                line += (i === cvsColumnsCount) ? `"${cell}"\n` : `"${cell}"${this.#delimiter}`;
                if (cell !== '') notEmpty = true;
            }
        }
        if (notEmpty) return line;
        else return '';
    }
}
