const mysql = require('mysql')

// 创建数据库连接对象
const db = mysql.createPool({
    host: '127.0.0.1',              //地址
    user: 'root',                   //用户名
    password: 'admin123',           //密码
    database: 'my_db_01',           //数据库名字
})

module.exports = db