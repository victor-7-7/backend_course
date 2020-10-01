
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

    start() {
        for(const timer of this.#timers) {
            this.#checkAndStartTimer(timer);
        }
    }

    stop() {
        for(const timer of this.#timers) {
            if ("id" in timer) TimersManager.#stop(timer);
        }
    }

    pause(name) {
        if (name === undefined) return;
        for(const timer of this.#timers) {
            if (timer.name === name && "id" in timer) {
                TimersManager.#stop(timer);
                break;
            }
        }
    }

    resume(name) {
        if (name === undefined) return;
        for(const timer of this.#timers) {
            if (timer.name === name) {
                this.#checkAndStartTimer(timer);
                break;
            }
        }
    }

    #checkAndStartTimer = (timer) => {
        if ('id' in timer) TimersManager.#stop(timer);
        if (timer.interval) timer.id = setInterval(this.#callback, timer.delay, timer);
        else timer.id = setTimeout(this.#callback, timer.delay, timer);
    };

    #callback = (timer) => {
        if (!timer.interval) delete timer.id;
        const result = timer.job(timer.args);
        this.#log({name: timer.name, in: timer.args, out: result, created: new Date().toLocaleString()});
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
manager.add(t2, 1, 2); // 5000
manager.start();
console.log(1);
setTimeout(() => manager.print(), 7000);

