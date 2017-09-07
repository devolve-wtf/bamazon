const mysql = require('mysql');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
    host:   'localhost',
    port:   3306,
    user:   'root',
    password:   '',
    database:   'bamazon'
});

function getProducts() {
    return new Promise(function(resolve, reject) {
        connection.query(
            'SELECT * FROM products', function(err, res) {
                if(err) return reject(err);
                resolve(res);
            }
        );
    });
}

function getProductById(id) {
    return new Promise(function(resolve, reject) {
        connection.query(
            'SELECT * FROM products WHERE item_id = ' + id, function(err, res) {
                if(err) return reject(err);
                resolve(res);
            }
        )
    });
}

function displayProducts(products) {
    for(product in products) {
        console.log(
           products[product].item_id,
            products[product].product_name,
            products[product].price,
            products[product].stock_quantity
        );
    }
}

function displayLowInventoryProducts(products) {
    for(product in products) {
        if(products[product].stock_quantity < 5) {
            console.log(
            products[product].item_id,
                products[product].product_name,
                products[product].price,
                products[product].stock_quantity
            );
        }
    }
}

function updateInventory() {
    getProducts().then(function(products) {
        let inventoryList = []
        for(product in products) {
            inventoryList.push({'name': products[product].product_name, 'qty': products[product].stock_quantity});
        }
        inquirer.prompt([
            {
                type: 'list',
                message: 'Which product would you like to add inventory to: ',
                choices: inventoryList,
                name: 'inventoryOptions'
            },
            {
                message: 'How many would you like to add: ',
                name: 'updateQuantity'
            }
        ]).then(function(answer) {
            let findObject = function(item) {
                return item.name === answer.inventoryOptions;
            }
            let object = inventoryList.find(findObject);
            let newQuantity = parseInt(object.qty) + parseInt(answer.updateQuantity);
            connection.query(
                'UPDATE products SET ? WHERE ?', 
                [
                    {
                        stock_quantity: newQuantity
                    },
                    {
                        product_name: answer.inventoryOptions
                    }
                ], 
                function(err, res) {
                    if(err) console.log(err);
                    console.log('\n' + answer.inventoryOptions + ' qty is now ' + newQuantity);
                    connection.destroy();
                }
            );
        });
    });
}

function addNewProduct() {
    inquirer.prompt([
        {
            name: 'productName',
            message: 'Product Name: '
        },
        {
            name: 'departmentName',
            message: 'Department Name'
        },
        {
            name: 'productPrice',
            message: 'Product Price: '
        },
        {
            name: 'productQuantity',
            message: 'Product Quantity'
        }
    ]).then(function(answer) {
        connection.query(
            'INSERT INTO products SET ?',
            {
                product_name: answer.productName,
                department_name: answer.departmentName,
                price: answer.productPrice,
                stock_quantity: answer.productQuantity
            },
            function(err, res) {
                if(err) throw err;
                console.log('\nProduct added successfully!');
                connection.destroy();
            }
        );
    });
}

function options() {
    inquirer.prompt([
        {
            type: 'list',
            message: 'Welcome Manager! What would you like to do?',
            choices: ['VIEW PRODUCTS FOR SALE', 'VIEW LOW INVENTORY', 'ADD TO INVENTORY', 'ADD NEW PRODUCT'],
            name: 'options'
        }
    ]).then(function(answer) {
        switch(answer.options) {
            case 'VIEW PRODUCTS FOR SALE':
                getProducts().then(function(products) {
                    displayProducts(products);
                });
                break;
            case 'VIEW LOW INVENTORY':
                getProducts().then(function(products) {
                    displayLowInventoryProducts(products);
                });
                break;
            case 'ADD TO INVENTORY':
                updateInventory();
                break;
            case 'ADD NEW PRODUCT':
                addNewProduct();
                break;
            default:
                break;
        }
    });
}

options();