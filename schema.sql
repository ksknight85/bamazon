DROP DATABASE IF EXISTS bamazonDB;

CREATE DATABASE bamazonDB;

USE bamazonDB;

CREATE TABLE products (
	item_id INTEGER NOT NULL AUTO_INCREMENT,
	product_name VARCHAR(100) NOT null,
	department_name VARCHAR(100) NOT NULL DEFAULT "not defined",
	price DECIMAL(10,2) NOT null,
	stock_quantity INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY (item_id)
	);
	
SELECT * FROM products;
	