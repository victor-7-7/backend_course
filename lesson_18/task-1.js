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

db.customers.createIndex({ email: 1 });

db.customers.createIndex({ 'name.first': 1, 'name.last': 1 });

db.customers.createIndex({ email: 1, created: -1 });

db.customers.getIndexes();
