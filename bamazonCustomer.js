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
            products[product].price
        );
    }
}

function sell() {
    inquirer.prompt([
        {
            name: 'item_id',
            message: 'What is the item number of the product you wish to purchase: '
        },
        {
            name: 'qty',
            message: 'How many would you like to purchase: '
        }
    ]).then(function(answers) {
        let id = answers.item_id;
        let qty = answers.qty;

        getProductById(id).then(function(product) {
            if(product[0].stock_quantity >= qty) {
                connection.query(
                    'UPDATE products SET ? WHERE ?', 
                    [
                        {
                            stock_quantity: product[0].stock_quantity - qty
                        },
                        {
                            item_id: id
                        }
                    ], 
                    function(err, res) {
                        if(err) throw err;
                        console.log(`\nYour order of ${qty} ${product[0].product_name} costs ${product[0].price * qty}`);
                        connection.destroy();
                    }
                )
            }else{
                console.log('\nInsufficient inventory');
                connection.destroy();
            }
        });
    });
}

getProducts().then(function(products) {
  displayProducts(products);
  sell(); 
});