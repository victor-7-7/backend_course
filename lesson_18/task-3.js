load('./random.js')
use lesson18db;
db.customers.drop();

const custAmount = 100;
const customers = [];

for (let i = 0; i < custAmount; i++) {
    customers.push({
        name: {
            first: faker.fName(),
            last: faker.lName()
        },
        nickname: 'nick' + i,
        email: faker.email(),
        password: 'pa$$' + i,
        created: new Date().toISOString()
    })
}

const result = db.customers.insertMany(customers);

db.customers.createIndex({
    'name.first': 'text', 'name.last': 'text', nickname: 'text', email: 'text'
});

db.customers.getIndexes();
