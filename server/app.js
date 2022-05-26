var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//调用checkAPP方法，{}内不可用其他名，相当于from A import B，须在B内exports.A
var {checkAPP,checkUser,checkAdmin}=require('./util/middleware')
//引入路由
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
//创建实例
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//允许跨域访问，前端根路由与后端根路由不一定一致
app.all('*',function(req,res,next){
  res.header("Access-Control-Allow-Origin","*")
  res.header("Access-Control-Allow-Headers","*")
  next()
})
//定义url
//访问所有路由（除根路由'/'）前均需要checkapp验证
app.use('/', checkAPP, indexRouter);
//app.use('/', indexRouter);
//users也会进行checkapp认证
app.use('/users', usersRouter);
//多个检测异步执行，注意顺序
app.use('/admin',[checkUser,checkAdmin],adminRouter)
module.exports = app;
