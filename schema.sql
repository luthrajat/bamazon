drop database if exists bamazon;
create database bamazon;

use bamazon;

create table products (item_id int(11) auto_increment primary key NOT NULL,
					  product_name varchar(50) not null,
                      department_name varchar(50) not null,
					  price int(11) not null,
                      stock_quantity int(11)); 
                      
create table departments (department_id int(11) auto_increment NOT NULL primary key, department_name varchar(30) NOT NULL, over_head_costs int(10) not null);                      
