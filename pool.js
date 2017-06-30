/**
 * Created by CH on 2016/4/4.
 */
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'dahouzi'
});

module.exports = pool;