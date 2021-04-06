use lesson16db
db.customers.drop();
db.orders.drop();

const custAmount = 3000;
const customers = [];

function rndInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

for (let i = 0; i < custAmount; i++) {
    customers.push({
        name: {
            first: 'John' + i,
            last: 'Dow' + i
        },
        balance: i,
        created: new Date().toISOString()
    })
}

const result = db.customers.insertMany(customers);

const orders = [];

for (const id of result.insertedIds) {
    const ordAmount = rndInt(1, 10);
    for (let i = 0; i < ordAmount; i++) {
        orders.push({
            customerId: id,
            count: rndInt(1, 100),
            price: rndInt(20, 100),
            discount: rndInt(5, 30),
            title: 'title' + i,
            product: 'product' + i
        })
    }
}
// stuff <-- чтобы не было вывода в консоль
const stuff = db.orders.insertMany(orders);

db.customers.find().pretty();
print('\n================================\n');
db.orders.find().pretty();

// it // Еще 20 элементов вывести в консоль

