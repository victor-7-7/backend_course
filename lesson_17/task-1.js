load('./random.js')
use lesson17db;
db.customers.drop();
db.orders.drop();

const custAmount = 5;
const customers = [];

for (let i = 0; i < custAmount; i++) {
    customers.push({
        name: {
            first: faker.fName(),
            last: faker.lName()
        },
        balance: randomNumber(100, 1000),
        created: new Date().toISOString()
    })
}

const result = db.customers.insertMany(customers);

const orders = [];

for (const id of result.insertedIds) {
    const ordAmount = randomNumber(1, 3);
    for (let i = 0; i < ordAmount; i++) {
        orders.push({
            customerId: id,
            count: randomNumber(1, 100),
            price: randomNumber(20, 100),
            discount: randomNumber(5, 30),
            title: 'title' + i,
            product: faker.product()
        })
    }
}
// stuff <-- чтобы не было вывода в консоль
const stuff = db.orders.insertMany(orders);

const { _batch } = db.customers.aggregate([
    { $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "customerId",
            as: "orders"
        }
    },
    { $unwind: "$orders" },
    { $set: { "orders._id": { $toString: "$orders._id"} } },
    { $group: {
            _id: "$_id",
            fName: { $first: "$name.first" },
            lName: { $first: "$name.last" },
            orders: { $push: "$orders" }
        }
    },
    { $unset: [ "_id", "orders.customerId", "orders.title" ] }
]);

printjson(_batch);

