let redis=require("../util/redisDB")
const {ALLOW_APP}=require('../config/app')
const util=require('./common')
//验证请求为app
exports.checkAPP=(req,res,next)=>{
  console.log(req.headers)
  if(!ALLOW_APP.includes(req.headers.fapp)){
    //返回json响应
    res.json(util.getReturnData(500,"request app wrong"))
  }else{
    next()
  }
}
exports.checkUser = (req, res, next) => {
    console.log("check login status")
    if ('token' in req.headers) {
        let key = req.headers.fapp + ":user:token:" + req.headers.token
        redis.get(key).then((data) => {
            if (data) {
                //保存用户名称
                req.username = data.username
                console.log('check'+req.username)
                next()
            } else {
                //key值错误或者是登录过期已经被删除
                res.json(util.getReturnData(403, "Login expired,Please login again",['expired']))
            }
        })
    } else {
        res.json(util.getReturnData(403, "Please login"))
    }
}
//检测是否是管理员
exports.checkAdmin = (req, res, next) => {
    console.log("check admin")
    if (req.headers.username == 'admin') {
        //如果是管理员，则在redis增加一个power
        let key = req.headers.fapp + ":user:power:" + req.headers.token
        console.log(key)
        redis.set(key, 'admin')
        redis.expire(key,6000)
        next()
    } else {
        res.json(util.getReturnData(403, "Power is not enough"))
    }
}