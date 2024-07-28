const sequelize = require('../utils/database');
const Customer = require('../models/customer');
const Order = require('../models/order');



async function addCustomer(){
    sequelize.sync({alter : true})

}
async function findCustomer(name){
    sqlsequelize.sync()
    .then((result)=>{
        console.log("connectes to db")
        return Customer.findAll({name})
    })
    .then(customer=>{
        console.log(customer);
    })
    .catch((err)=>{
        console.log(err);
    })
}
module.exports = {addCustomer,findCustomer};