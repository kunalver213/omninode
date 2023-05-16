const mysql = require('mysql')
const dbConfig = require('./config/db_config');

// const connection = mysql.createConnection({
//   host: '192.168.6.10',
//   user: 'merchantPortal',
//   password: 'omniMerchant@2023',
//   database: 'OMNI_MERCHANT_PORTAL'
// })

const connection = mysql.createConnection(dbConfig.db)

connection.connect(function(error){
    if(error){        
        console.log('FAIL');
        throw error;
    }else{
        console.log('success');
    }
});

module.exports = connection;