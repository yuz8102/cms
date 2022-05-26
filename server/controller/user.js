let redis=require("../util/redisDB")
//导入模块，相当于import XXX
const util=require("../util/common")
const crypto = require('crypto')

exports.userRegister = (req, res, next) => {
  //获取用户名、密码和其他资料
  let username = req.body.username
  let password = req.body.password
  let ip = req.ip
  if(username||password){
    let key='book:user:info:'+username
    redis.get(key).then((user)=>{
      if(user){
        res.json(res.json(util.getReturnData(1,'User already Exists')))
      }else{
        let userData={
          phone:'phone' in req.body?req.body.phone:'Unknow',
          nikename:'nikename' in req.body?req.body.nikename:'Unknow',
          age:'age' in req.body?req.body.age:'Unknow',
          sex:'sex' in req.body?req.body.sex:'Unknow',
          ip:ip,
          username:username,
          password:password,
          //是否封停
          login:0
        }
        redis.set(key,userData)
        res.json(res.json(util.getReturnData(0,'Register successfully,Plz login')))
      }
    })
  }else{
    res.json(res.json(util.getReturnData(1,'message uncomplete')))
  }
}

exports.userLogin=(req,res,next)=>{
  let username=req.body.username
  let password=req.body.password
  redis.get(req.headers.fapp+":user:info:"+username).then((data)=>{
    if(data){
      if(data.login==0){
        if(data.password!=password){
          res.json(util.getReturnData(1,'username or password is wrong'))
        }else{
          let token=crypto.createHash('md5').update(Date.now()+username).digest("hex")
          let tokenKey=req.headers.fapp+":user:token:"+token
          delete data.password
          redis.set(tokenKey,data)
          redis.expire(tokenKey,6000)
          res.json(util.getReturnData(0,'login successfully',{token:token}))
        }
      }else{
        res.json(util.getReturnData(1,'Account has been stopped'))
      }
    }else{
      res.json(util.getReturnData(1,'username or password is wrong'))
    }
  })
}

exports.loginStatus=(req,res,next)=>{
  console.log("get login status")
    if ('token' in req.headers) {
        let key = req.headers.fapp + ":user:token:" + req.headers.token
        redis.get(key).then((data) => {
            if (data) {
                //保存用户名称
                req.username = data.username
                console.log(req.username)
                res.json(util.getReturnData(0))
            } else {
                //key值错误或者是登录过期已经被删除
                res.json(util.getReturnData(403, "expired"))
            }
        })
    } else {
        res.json(util.getReturnData(403, "not login"))
    }
}