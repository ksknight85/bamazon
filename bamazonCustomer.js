var inquirer = require('inquirer');
var clear = require('clear');
var mysql = require("mysql");
var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
    user: "root",
    password: "root",
    database: "bamazonDB",
});

connection.connect(function (err) {
    if (err) throw err;
    console.log(`Connected as ID ${connection.threadId}.`)
});


var itemsArr = [];

function findItems() {
    var query = "SELECT * FROM products"
    connection.query(query, function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            itemsArr.push(res[i]);
        }
    });
};

function productsForSale() {
    var query = "SELECT * FROM products"
    connection.query(query, function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log(`ID: ${res[i].item_id} || Item name: ${res[i].product_name}\nPrice: ${res[i].price} || Department: ${res[i].department_name} || In-Stock: ${res[i].stock_quantity} \n`);
        }
    })
};

function lowInventory() {
    var query = "SELECT * FROM products WHERE stock_quantity < 10"
    connection.query(query, function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log(`ID: ${res[i].item_id} || Item name: ${res[i].product_name}\nPrice: ${res[i].price} || Department: ${res[i].department_name} || In-Stock: ${res[i].stock_quantity} \n`);
        }
        start();
    })
};


function addToInventory() {
    for (var i = 0; i < itemsArr.length; i++) {
        console.log(`ID: ${itemsArr[i].item_id} || Item name: ${itemsArr[i].product_name}\nPrice: ${itemsArr[i].price} || Department: ${itemsArr[i].department_name} || In-Stock: ${itemsArr[i].stock_quantity} \n`);
    }

    inquirer
        .prompt([
            {
                type: "input",
                message: "Which item would you like to update?",
                name: "id",
                validate: function (value) {
                    if (isNaN(value) === false && value > 0 && value <= itemsArr.length) {
                        return true
                    }
                    console.log("\n\nPlease enter the ID# of a product above.\n\n")
                    return false
                }
            },
            {
                type: "input",
                message: "How many units are you adding?",
                name: "quantity",
            }
        ]).then(function (answer) {
            var item = parseInt(answer.id);
            var quantity = parseInt(answer.quantity);
            var newQuantity = itemsArr[item - 1].stock_quantity + quantity;
            var query = connection.query("UPDATE products SET ? WHERE ?",
                [
                    {
                        stock_quantity: newQuantity
                    },
                    {
                        item_id: item
                    }
                ], function (err, res) {
                    console.log(`\n\nProduct ${itemsArr[item - 1].item_id} has been updated. New stock quantity is: ${newQuantity}\n\n`)
                    setTimeout(start, 200);

                })
        });

};

function addNewProduct() {
    inquirer
        .prompt([
            {
                type: "input",
                message: "What is the product's name?",
                name: "name",
            },
            {
                type: "input",
                message: "What is the product's department?",
                name: "department",
            },
            {
                type: "input",
                message: "What is the product's price?",
                name: "price",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true
                    }
                    console.log("\n\nPlease enter a dollar amount.\n\n")
                    return false
                }
            },
            {
                type: "input",
                message: "What is the products quantity?",
                name: "quantity",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true
                    }
                    console.log("\n\nPlease enter the number of items in stock.\n\n")
                    return false
                }
            }
        ]).then(function (answer) {
            var product_name = answer.name;
            var department_name = answer.department;
            var price = parseFloat(answer.price);
            var stock_quantity = parseInt(answer.quantity);

            console.log(`\nItem name: ${product_name}\nPrice: ${price} || Department: ${department_name} || In-Stock: ${stock_quantity} \n`);
            inquirer
                .prompt([
                    {
                        type: "rawlist",
                        message: "Is this correct?",
                        choices: ["Yes", "No", "Exit"],
                        name: "action",
                    }
                ]).then(function (answer) {
                    switch (answer.action) {
                        case "Yes":
                            connection.query("INSERT INTO products SET ?",
                                {
                                    product_name: product_name,
                                    price: price,
                                    department_name: department_name,
                                    stock_quantity: stock_quantity,
                                }
                                , function (err, res) {
                                    if (err) throw err;
                                    console.log(`Inserted ${product_name} into products database\n\n`);
                                })
                            setTimeout(start, 200);
                            break;

                        case "No":
                            addNewProduct()
                            break;

                        case "Exit":
                            connection.end();
                            break;
                    }
                });
        });
};

function start() {

    inquirer
        .prompt([
            {
                type: "rawlist",
                message: "What would you like to do?",
                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"],
                name: "action",
            }
        ]).then(function (answer) {
            switch (answer.action) {
                case "View Products for Sale":
                    productsForSale();
                    setTimeout(start, 200);
                    break;

                case "View Low Inventory":
                    lowInventory();
                    break;

                case "Add to Inventory":
                    addToInventory();
                    break;

                case "Add New Product":
                    addNewProduct();
                    break;

                case "Exit":
                    connection.end();
                    break;
            }
        });
};
findItems();

setTimeout(start, 200);