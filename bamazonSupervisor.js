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
		choices: ['View Product Sales by Department', 'Create New Department'],
		message: 'List a set of menu options for admin:',
		filter: function(val) {
			return val;
		}
	}
];

var addDepartmentQuestions = [
	{
		type: 'input',
		name: 'dept',
		message: 'Please enter the department_name to add.',
		validate: function(val) {
			return (val.trim().length>0);
		},
		filter: function(val) {
			return val;
		}
	},
	{
                type: 'input',
                name: 'cost',
                message: 'Please enter the department overhead cost to add.',
		validate: function(val) {
			return parseInt(val)>0;
		},
                filter: function(val) {
                        return parseInt(val);
                }
        }
];


var displaySupervisorOptions = function() {
          inquirer.prompt(menuQuestions)
                .then(function (answers) {   
			switch(answers.menu) {
				case 'View Product Sales by Department':
					listDeptDetails();
					break;
				case 'Create New Department':
					addDept();
					break;
				default:
					console.log("Unknown Supervisor menu selection.");
					break;
			}	
                });
}

var addDept = function() {
	 inquirer.prompt(addDepartmentQuestions)
                .then(function (answers) {
                        console.log(answers.dept);
                        connection.query("insert into departments (department_name, over_head_costs) values (?, ?)",[answers.dept, answers.cost],  function(err, result) {
                                if (err) {
                                        console.log(err);
                                } else {
                                        displayAllItems();
                                }
                        }
                );
         });
}

var listDeptDetails = function() {
			connection.query("select * from products",  function(err, result) {
				if (err) {
					console.log(err);
				} else {
					handleScreenDisplay(result);
				}
			});
}


function displayAllItems() {
		connection.query("select * from products",  function(err, result) {
			handleScreenDisplay(result);
                 });
}

function handleScreenDisplay(result) {
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
		   displaySupervisorOptions();
}
displaySupervisorOptions();
