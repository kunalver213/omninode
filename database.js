const mysql = require('mysql')

const connection = mysql.createConnection({
  host: '192.168.6.10',
  user: 'merchantPortal',
  password: 'omniMerchant@2023',
  database: 'OMNI_MERCHANT_PORTAL'
})

connection.connect(function(error){
    if(error){        
        console.log('FAIL');
        throw error;
    }else{
        console.log('success');
    }
});

// connection.query('SELECT 1 + 1 AS solution', (err, rows, fields) => {
//   if (err) throw err

//   console.log('The solution is: ', rows[0].solution)
// })

// connection.end()

module.exports = connection;