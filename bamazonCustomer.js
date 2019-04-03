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

var itemId = "";
var itemQuantity = 0;
var itemPrice = 0;
var item = "";
var itemsArr = [];
var newQuantity = 0;

function findItems() {


    var query = "SELECT * FROM products"
    connection.query(query, function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log(`Item name: ${res[i].product_name}\nID: ${res[i].item_id}  || In-Stock: ${res[i].stock_quantity}  || Price: ${res[i].price} \n\n`);
            itemsArr.push(res[i]);
        }
        start();
    })
};

function updateProducts() {
    var query = connection.query("UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: newQuantity
            },
            {
                item_id: itemId
            }
        ], function (err, res) {
            if (err) throw err;
            inquirer
                .prompt([
                    {
                        type: "rawlist",
                        choices: ["Purchase another item", "Exit"],
                        name: "choice",
                    }
                ]).then(function (res) {
                    if (res.choice === "Purchase another item") {
                        clear();
                        findItems();
                    }
                    else {
                        connection.end();
                    }
                })
        })
};

function start() {
    inquirer
        .prompt([
            {
                type: "input",
                message: "Which item would you like to buy?",
                name: "item_id",
                validate: function (value) {
                    if (isNaN(value) === false && value > 0 && value <= itemsArr.length) {
                        return true
                    }
                    console.log("\n\nPlease enter the ID# of a product above.\n\n")
                    return false
                }
            }
        ]).then(function (res) {
            var i = parseInt(res.item_id) - 1;
            itemId = itemsArr[i].item_id;
            itemQuantity = parseInt(itemsArr[i].stock_quantity);
            itemPrice = parseFloat(itemsArr[i].price);
            item = itemsArr[i].product_name;

            inquirer
                .prompt([
                    {
                        type: "input",
                        message: "How many would you like to purchase?",
                        name: "quantity",
                        validate: function (value) {
                            if (isNaN(value) === false && value > 0 && value <= itemQuantity) {
                                return true
                            }
                            console.log("\n\nPlease enter a number less than or equal to the total in-stock\n\n")
                            return false
                        }
                    }
                ]).then(function (res) {
                    var purchasequantity = parseInt(res.quantity);
                    newQuantity = itemQuantity - purchasequantity;
                    updateProducts()
                    var total = itemPrice * purchasequantity;
                    console.log(`\n\nPurchase complete.  Total: $${total}.\n\n`)
                })
        });
}
findItems();
