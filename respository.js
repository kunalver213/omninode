const db = require('./database');


function login(){
    console.log('inlogin');
    var name = 'aa';
    db.query('select * from retailerid limit 10', (err, rows, fields) => {
        if (err) throw err
      
        console.log('The solution is: ', rows[0].Name);
        name = ''+rows[0].Name;
        return name;
    });
    db.end();
    return name;
}

module.exports = { login };