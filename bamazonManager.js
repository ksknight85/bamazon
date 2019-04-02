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
        start();
    })
};

function productsForSale () {
    var query = "SELECT * FROM products"
    connection.query(query, function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log(`ID: ${res[i].item_id} || Item name: ${res[i].product_name}\nPrice: ${res[i].price} || In-Stock: ${res[i].stock_quantity} \n`);
        }
        start();
    })
};

function start() {
    inquirer
        .prompt([
            {
                type: "rawlist",
                message: "What would you like to do?",
                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
                name: "action",
            }
        ]).then(function (answer) {
            switch (answer.action) {
                case "View Products for Sale":
                productsForSale();
            }
        })
}

findItems();