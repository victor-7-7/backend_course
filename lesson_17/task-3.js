load('./random.js')
use lesson17db;
db.customers.drop();
db.orders.drop();

const custAmount = 10;
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
    const ordAmount = randomNumber(1, 5);
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

const { _batch } = db.orders.aggregate([
    { $group: {
            _id: { customerId: "$customerId", product: "$product" },
            total: { $sum: "$count" }
        }
    },
    { $group: {
            _id: "$_id.customerId",
            orders: { $push: { _id: "$_id.product", total: "$total" } }
        }
    },
    { $lookup: {
            from: "customers",
            localField: "_id",
            foreignField: "_id",
            as: "customer"
        }
    },
    { $unwind: "$customer" },
    { $set: {
            fName: "$customer.name.first",
            lName: "$customer.name.last"
        }
    },
    { $unset: [ "_id", "customer" ] }
]);

const size = 3
const pages = Math.ceil(_batch.length / size); // 3.1 => 4

function printPage(size, page) {
    print(`===================Page: ${page+1}===================`);
    const slice = _batch.slice(page * size, (page + 1) * size);
    printjson(slice);
}

for (let page = 0; page < pages; page++) {
    printPage(size, page);
}
