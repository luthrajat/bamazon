var inquirer = require("inquirer");
var express = require("express");
var mysql = require("mysql");
var bodyParser = require ("body-parser");
var Table = require('cli-table');

var app = express();
var PORT = 3000;

var connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "bamazon"
});

connection.connect(function(err) {
        if (err) {
                console.log("Error connecting to the mysql db");
        } else {
                console.log("Connected to db " + connection.threadId);
        }
});

var menuQuestions = [
	{
		type: 'list',
		name: 'menu',
		choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory','Add New Product'],
		message: 'List a set of menu options for admin:',
		filter: function(val) {
			return val;
		}
	}
];

var addQuestions = [
	{
                type: 'input',
                name: 'id',
                message: 'Please enter the item_id of the product you would like to add.',
                filter: function (val) {
                        return parseInt(val);
                }
        },
        {
                type: 'input',
                name: 'qty',
                message: 'Please enter the quantity of the product you would like to add.',
                filter: function (val) {
                        return parseInt(val);
                }
        }
];

var purchaseQuestions = [
    	addQuestions[1],
	{
    		type: 'input',
    		name: 'product_name',
    		message: 'Please enter the  of the product name you would like to add.',
    		filter: function (val) {
      			return val;
    		}
	},
	{
                type: 'input',
                name: 'department_name',
                message: 'Please enter the  of the department name you would like to add.',
                filter: function (val) {
                        return val;
                }
        },
	{
                type: 'input',
                name: 'price',
                message: 'Please enter the  of the price you would like to add.',
                filter: function (val) {
                        return parseInt(val);
                }
        }
];


function updateProduct(purchaseOrder, stockQty, price) {
			var qtyLeft = parseInt(stockQty) - parseInt(purchaseOrder.qty);
			connection.query("update products set stock_quantity = ?  where item_id = ? ",[qtyLeft, purchaseOrder.id],  function(err, result) {
                                console.log("Total cost of your purchase: $" + (purchaseOrder.qty*price));
				displayAllItems();
                        });
}

var addNewProduct = function() {
	  inquirer.prompt(purchaseQuestions)
	        .then(function (answers) {
connection.query("insert into products (stock_quantity, product_name, department_name, price) values (?,?,?,?) ",[answers.qty, answers.product_name, answers.department_name, answers.price],  function(err, result) {
				displayAllItems();
			}
		);
		});
}

var askQuestion = function() {
        inquirer.prompt(menuQuestions)
        .then(function (answers) {
			switch(answers.menu) {
				case 'View Products for Sale':
					displayAllItems();					
					break;
				case 'View Low Inventory':
					displayLowInventoryItems(5);
					break;
				case 'Add to Inventory':
					addToInventory();
					break;
				case 'Add New Product':
					addNewProduct();
					break;
				default:
					break;
			}
                 });
}

var addToInventory = function() {
		inquirer.prompt(addQuestions).then(function (answers) {
        	       connection.query("update products set stock_quantity = stock_quantity+?  where item_id = ? ",[answers.qty, answers.id],  function(err, result) {
                	                displayAllItems();
               		});
		});
}

function displayLowInventoryItems(numberOfItems) {
	connection.query("select * from products where stock_quantity < ? ",[numberOfItems],  function(err, result) {
                        handleScreenDisplay(result);
        });
}

function displayAllItems() {
		connection.query("select * from products",  function(err, result) {
			handleScreenDisplay(result);
                 });
}

function handleScreenDisplay(result) {
	 var table = new Table({
                       head: ['item_id','product_name','department_name','price' , 'stock_quantity']
                   });

                   for (var i = 0; i < result.length; i++) {
                     var row = [];
                     row.push(result[i].item_id);
                     row.push(result[i].product_name);
                     row.push(result[i].department_name);
                     row.push(result[i].price);
                     row.push(result[i].stock_quantity);
                     table.push(row);
                   }
                   console.log(table.toString());
                                   askQuestion();
}

displayAllItems();

