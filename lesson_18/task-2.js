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

customers.push({
    name: {
        first: faker.fName(),
        last: faker.lName()
    },
    nickname: 'nick' + 100,
    email: 'some@email.com',
    password: 'pa$$' + 100,
    created: new Date().toISOString()
})

db.customers.createIndex({ email: 1, nickname: 1 }, { unique: true });

const result = db.customers.insertMany(customers);

db.customers.getIndexes();

db.customers.insert({
    name: {
        first: faker.fName(),
        last: faker.lName()
    },
    nickname: 'nick' + 100,
    email: 'some@email.com',
    password: 'pa$$' + 100,
    created: new Date().toISOString()
})

// WriteResult({
//         "nInserted" : 0,
//         "writeError" : {
//                 "code" : 11000,
//                 "errmsg" : "E11000 duplicate key error collection: lesson18db.customers index: email_1_nickname_1 dup key: { email: \"some@email.com\", nickname: \"nick100\" }"
//         }
// })
