var express = require('express');
var router = express.Router();

var {userLogin,userRegister,loginStatus}=require('../controller/user')
var {checkUser}=require('../util/middleware')
var {articleTalk}=require('../controller/userNeedCheck')

/* GET users listing. 会拼接上users/，具体在app.js中定义*/
router.post('/login',userLogin)
router.post('/register',userRegister)
router.get('/loginstatus',loginStatus)
router.post('/user/article/talk',articleTalk)

//需要验证的放在userNeedCheck里
router.use('/user',checkUser,require('./userNeedCheck'))

module.exports = router;
