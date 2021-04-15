// 导入express模块
const express = require('express')
// 创建 express的服务器实例
const app = express()
const joi = require('@hapi/joi')

//导入cors跨域处理中间件
const cors = require('cors')
//将cors注册为全局中间件
app.use(cors())

// 配置解析表单数据的中间件，注意：这个中间件，只能解析 application/x-www-form-urlencoded 格式的表单数据
app.use(express.urlencoded({ extended: false }))

// 一定要在路由之前，封装 res.cc 函数
app.use((req, res, next) => {
  // status 默认值为 1，表示失败的情况
  // err 的值，可能是一个错误对象，也可能是一个错误的描述字符串
  res.cc = function (err, status = 1) {
    res.send({
      status,
      message: err instanceof Error ? err.message : err,
    })
  }
  next()
})


// 一定要在路由之前配置解析 Token 的中间件
const config = require('./config')
// 解析 token 的中间件
const expressJWT = require('express-jwt')


// 使用 .unless({ path: [/^\/api\//] }) 指定哪些接口不需要进行 Token 的身份认证
app.use(expressJWT({ secret: config.jwtSecretKey }).unless({ path: [/^\/api\//] }))




// 导入并使用用户路由模块
const userRouter = require('./router/user')
// 导入并使用用户信息路由模块
const userInfoRouter = require('./router/userinfo')
//导入并使用文章分类路由模块
const artCateRouter = require('./router/artcate')
//为文章的路由挂载统一的访问前缀 /my/article
app.use('/my/article', artCateRouter)
// 导入并使用文章路由模块
const articleRouter = require('./router/article')
// 为文章的路由挂载统一的访问前缀 /my/article
app.use('/my/article', articleRouter)
// 托管静态资源文件
app.use('/uploads', express.static('./uploads'))




// 错误中间件
app.use(function (err, req, res, next) {
  // 数据验证失败
  if (err instanceof joi.ValidationError) return res.cc(err)
  // 捕获身份认证失败的错误
  if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
  // 未知错误
  res.cc(err)
})

app.listen(8090, function () {
  console.log('api server running at http://127.0.0.1:8090')
})