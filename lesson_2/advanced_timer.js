
class TimersManager {
    #timers = [];

    #logs = [];
    #log = (log) => this.#logs.push(log);
    print = () => console.log(this.#logs);

    add(timer, ...args) {
        if(!('name' in timer && typeof timer.name === 'string'
            && timer.name.length > 0)) throw new TypeError(
            'Таймер должен содержать свойство name. Это свойство ' +
            'должно быть строковым литералом ненулевой длины'
        );
        // Значение свойства name не должно совпадать со значениями
        // свойства name других таймеров в массиве
        let coincide = false;
        for(const element of this.#timers)  {
            if (timer.name === element.name) {
                coincide = true;
                break;
            }
        }
        if (coincide) throw new TypeError('В коллекции уже есть таймер ' +
            `со значением свойства name -> ${timer.name}`);

        if(!('delay' in timer && typeof timer.delay === 'number'))
            throw new TypeError('Таймер должен содержать свойство delay типа number');

        if(timer.delay < 0 || timer.delay > 5000)
            throw new TypeError('Задержка таймера не должна быть < 0 или > 5000');

        if(!('interval' in timer && typeof timer.interval === 'boolean'))
            throw new TypeError('Таймер должен содержать свойство interval типа boolean');

        if(!('job' in timer && typeof timer.job === 'function'))
            throw new TypeError('Таймер должен содержать свойство job типа function');

        timer.args = args;
        this.#timers.push(timer);
        return this;
    }

    remove(name) {
        if (name === undefined) return;
        let done = false;
        this.#timers.forEach((timer, index) => {
            if (!done && timer.name === name) {
                // Если таймер в процессе отсчета, то отменяем его
                if ("id" in timer) clearTimeout(timer.id);
                // Удаляем таймер из массива
                this.#timers.splice(index, 1);
                // There is no way to stop or break a forEach() loop
                done = true;
            }
        })
    }

    start(name) {
        // Если нет аргумента, то запускаем ВСЕ таймеры (кроме
        // тех, что на паузе или в процессе отсчета)
        if (name === undefined) {
            for(const timer of this.#timers) {
                this.#checkAndStartTimer(timer)
            }
        } else {
            // Запускаем конкретный таймер
            for(const timer of this.#timers) {
                if (timer.name === name) {
                    this.#checkAndStartTimer(timer);
                    break;
                }
            }
        }
    }

    stop(name) {
        // Если нет аргумента, то останавливаем все работающие таймеры
        if (name === undefined) {
            for(const timer of this.#timers) {
                if ("id" in timer) TimersManager.#stop(timer);
            }
        } else {
            // Останавливаем конкретный таймер, если он работает
            for(const timer of this.#timers) {
                if (timer.name === name && "id" in timer) {
                    TimersManager.#stop(timer);
                    break;
                }
            }
        }
    }

    pause(name) {
        if (name === undefined) return;
        // Приостанавливаем конкретный таймер, если он работает
        for(const timer of this.#timers) {
            if (timer.name === name && "id" in timer) {
                TimersManager.#stop(timer);
                timer.pauseMoment = Date.now();
                break;
            }
        }
    }

    resume(name) {
        if (name === undefined) return;
        // Возобновляем работу конкретного таймера, если он был приостановлен
        for(const timer of this.#timers) {
            if (timer.name === name) {
                if ("pauseMoment" in timer) {
                    this.#startTimer(timer, this.#callback);
                }
                break;
            }
        }
    }

    #checkAndStartTimer = (timer) => {
        // Если таймер не на паузе и не в процессе отсчета (либо ни разу не
        // запускался, либо не интервальный и уже отработал, либо был
        // остановлен методом stop), то запускаем его
        if (timer.pauseMoment === undefined && timer.id === undefined) {
            this.#startTimer(timer, this.#callback);
        }
    };

    #startTimer = function(timer, cb) {
        let delay = timer.delay;
        // Если стартуем таймер после его приостановки
        if ('pauseMoment' in timer) {
            // Устанавливаем в качестве задержки недоработанное таймером время
            delay = timer.delay - (timer.pauseMoment - timer.startMoment);
        }
        if (timer.interval) timer.id = setInterval(cb, delay, timer);
        else timer.id = setTimeout(cb, delay, timer);
        timer.startMoment = Date.now();
    };

    #callback = (timer) => {
        if (!timer.interval) {
            delete timer.id;
            if ('pauseMoment' in timer) delete timer.pauseMoment;
        }
        try {
            const result = timer.job(timer.args);
            this.#log({name: timer.name, in: timer.args, out: result, created: new Date().toLocaleString()});
        } catch (e) {
            const err = {name: e.name, message: e.message, /*stack: e.stack*/};
            this.#log({name: timer.name, in: timer.args, error: err, created: new Date().toLocaleString()});
        }
        if (timer.interval) {
            // Если это первый колбэк после возобновления работы
            // интервального таймера, то величина задержки грязная
            if ('pauseMoment' in timer) {
                delete timer.pauseMoment;
                clearTimeout(timer.id);
                // Теперь величина задержки будет валидная
                timer.id = setInterval(this.#callback, timer.delay, timer);
            }
            timer.startMoment = Date.now();
        }
    };

    static #stop = (timer) => {
        clearTimeout(timer.id);
        delete timer.id;
    }
}

// Parentheses can be omitted if the constructor takes no arguments.
const manager = new TimersManager;

const t1 = {
    name: 't1',
    delay: 1000,
    interval: false,
    job: () => { console.log('t1') }
};

const terr = {
    name: 'terr',
    delay: 3000,
    interval: true,
    job: () => { throw new Error('We have a problem!') }
};

const t2 = {
    name: 't2',
    delay: 5000,
    interval: false,
    job: args => {
        let result = args[0] + args[1];
        console.log(result)
        return result;
    }
};

manager.add(t1); // 1000
manager.add(terr) // 3000
manager.add(t2, 1, 2); // 5000
manager.start();
console.log(1);

setTimeout(() => manager.pause('terr'), 2000)
setTimeout(() => manager.stop('t2'), 4000)
setTimeout(() => manager.print(), 6000)

setTimeout(() => manager.resume('terr'), 7000)
setTimeout(() => manager.print(), 9000)

setTimeout(() => manager.start('t2'), 10000)
setTimeout(() => manager.print(), 16000)

setTimeout(() => manager.remove('terr'), 17000)
setTimeout(() => manager.print(), 27000)


