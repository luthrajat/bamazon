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

var salesQuestions = [
  {
    type: 'input',
    name: 'id',
    message: 'Please enter the ID of the product you would like to buy',
    filter: function (val) {
      return parseInt(val);
    }
  },
  {
    type: 'input',
    name: 'qty',
    message: 'Please enter the quantity of the product you would like to buy',
    filter: function (val) {
      return parseInt(val);
    }
  }
];

function updateProduct(purchaseOrder, stockQty, price) {
			var qtyLeft = parseInt(stockQty) - parseInt(purchaseOrder.qty);
			var salesValue = (purchaseOrder.qty*price);
			connection.query("update products set stock_quantity = ?, product_sales = product_sales + ?  where item_id = ? ",[qtyLeft, salesValue, purchaseOrder.id],  function(err, result) {
				if (err) {
					console.log(err);
					return;
				}
                                console.log("Total cost of your purchase: $" + (purchaseOrder.qty*price));
				displayItem(purchaseOrder.id);
				displayAllItems();
                        });
	
}

var askQuestion = function() {
inquirer.prompt(salesQuestions)
        .then(function (answers) {
			connection.query("select * from products where item_id = ? ",[answers.id],  function(err, result) {		
				if(result[0].stock_quantity < answers.qty) {
					console.log("Insufficient quantity!");
				} else {
					updateProduct(answers, result[0].stock_quantity, result[0].price);
				}	
			});
                 });
}

function displayItem(id) {
	 connection.query("select * from products where item_id =?",[id],  function(err, result) {
                        displayTable(result);
         });
}

function displayAllItems() {
		connection.query("select * from products",  function(err, result) {
			displayTable(result, true);
                 });
}

displayAllItems();

function displayTable(result, displayQuestion) {
	var table = new Table({
                       head: ['item_id','product_name','department_name','price' , 'stock_quantity','product_sales']
                   });

                   for (var i = 0; i < result.length; i++) {
                     var row = [];
                     row.push(result[i].item_id);
                     row.push(result[i].product_name);
                     row.push(result[i].department_name);
                     row.push(result[i].price);
                     row.push(result[i].stock_quantity);
                     row.push(result[i].product_sales);
                     table.push(row);
                   }
                   console.log(table.toString());

		   if (displayQuestion) askQuestion();

}

app.get("/", function(req, res) {
    html = "<h1>Usage:</h1><br/><ul>";
    html += "<li>/cast</li>";
    html += "<li>/coolness_points</li>";
    html += "<li>/attitude-chart/:att</li> e.g. :att => 'relaxed, cool, dumbo, hyper'";
    res.send(html);
});

app.get("/products/:dept", function(req, res) {
        var department = req.params.dept;
	connection.query("select * from products where department_name  = ? order by item_id asc", [department],  function(err, result) {
                        res.json(result);
        });
});

app.get("/attitude-chart/:att", function(req, res) {
        var html = "";
        connection.query("select * from actors where attitude = ? order by id asc", [req.params.att],  function(err, result) {
                html += buildHTML("Attribute", result);
                res.send(html);
        });
});


app.listen(PORT);



