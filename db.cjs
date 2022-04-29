const mysql = require('mysql2');
const pool = mysql.createPool({
    host: "eu-cdbr-west-02.cleardb.net",
    user: "b6ff97e8c4b140",
    password: "8cb27c26",
    database: "heroku_8a1a9739d733b57",
    multipleStatements: true
});

module.exports.pool = pool.promise();
// mysql://b6ff97e8c4b140:8cb27c26@eu-cdbr-west-02.cleardb.net/heroku_8a1a9739d733b57?reconnect=true