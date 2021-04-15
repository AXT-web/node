// 导入数据库操作模块
const db = require('../db/index')
// 用于加密密码的中间件
const bcrypt = require('bcryptjs')
// 用于生成token字符串
const jwt = require('jsonwebtoken')
// 导入全局的配置文件
const config = require('../config')


// 注册
exports.regUser = (req, res) => {
    // 接收表单数据
    const userinfo = req.body
    // 判断数据是否合法
    if (!userinfo.username || !userinfo.password) {
        return res.send({ status: 1, message: '用户名或密码不能为空！' })
    }
    // 定义sql语句，查询用户是否被占用
    const sql = `select * from ev_users where username=?`
    db.query(sql, [userinfo.username], function (err, results) {
        // 执行 SQL 语句失败
        if (err) {
            return res.send({ status: 1, message: err.message })
        }
        // 用户名被占用
        if (results.length > 0) {
            return res.send({ status: 1, message: '用户名被占用，请更换其他用户名！' })
        }
        // 对用户的密码,进行 bcrype 加密，返回值是加密之后的密码字符串
        userinfo.password = bcrypt.hashSync(userinfo.password, 10)
        // 定义sql语句，插入新用户
        const sql = 'insert into ev_users set ?'
        db.query(sql, { username: userinfo.username, password: userinfo.password }, function (err, results) {
            // 执行 SQL 语句失败
            if (err) return res.send({ status: 1, message: err.message })
            // SQL 语句执行成功，但影响行数不为 1
            if (results.affectedRows !== 1) {
                return res.send({ status: 1, message: '注册用户失败，请稍后再试！' })
            }
            // 注册成功
            res.send({ status: 0, message: '注册成功！' })
        })
    })
}

// 登录
exports.login = (req, res) => {
    // 接收表单数据
    const userinfor = req.body
    const sql = `select * from ev_users where username=?`
    db.query(sql, userinfor.username, function (err, results) {
        // 执行SQL语句出错
        if (err) return res.cc(err)
        // 执行SQL语句成功，但是查询到的数据条数不等于1
        if (results.length !== 1) return res.cc('登录失败！')
        // 用拿到的数据和数据库的数据进行比较，如果对比的结果为false，则证明用户输入的密码错误
        const compareResult = bcrypt.compareSync(userinfor.password, results[0].password)
        if (!compareResult) {
            return res.cc('登录失败！')
        }
        // TODO：登录成功，生成 Token 字符串
        const user = { ...results[0], password: '', user_pic: '' }
        // 生成 Token 字符串
        const tokenStr = jwt.sign(user, config.jwtSecretKey, {
            expiresIn: '10h', // token 有效期为 10 个小时
        })
        res.send({
            status: 0,
            message: '登录成功！',
            // 为了方便客户端使用 Token，在服务器端直接拼接上 Bearer 的前缀
            token: 'Bearer ' + tokenStr,
        })
    })
    res.send('login Ok')
}