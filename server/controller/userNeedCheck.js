let redis=require("../util/redisDB")
//导入模块，相当于import XXX
const util=require("../util/common")
const crypto = require('crypto')

exports.articleTalk=(req,res,next)=>{
  if ('a_id' in req.body && 'talk' in req.body) {
    let talk={talk:req.body.talk,time:Date.now(),username:req.username}
    let key=req.headers.fapp+':article:'+req.body.a_id+':talk'
    redis.get(key).then((data)=>{
      let tData=[]
      if(data){
        tData=data
      }else{
        tData.push(talk)
      }
      redis.set(key,tData)
      res.json(util.getReturnData(0,'send comment successfully'))
    })
  }else{
    res.json(util.getReturnData(1,'somthing error'))
  }
}

exports.getUserInfo=(req,res,next)=>{
  redis.get(req.headers.fapp+":user:info:"+req.params.username).then((data)=>{
    if(data){
      if(req.params.username==req.username){
        delete data.password
      }else{
        delete data.phone
        delete data.password
      }
      res.json(util.getReturnData(0,'',data))
    }else{
      res.json(util.getReturnData(1,'user does not exist'))
    }
  })
}

exports.changeUserInfo=(req,res,next)=>{
  let key=req.headers.fapp+':user:info:'+req.username
  redis.get(key).then((data)=>{
    if(data){
      let userData={
        username:req.username,
        phone:'phone' in req.body?req.body.phone:data.phone,
        nikename:'nikename' in req.body?req.body.nikename:data.nikename,
        age:'age' in req.body?req.body.age:data.age,
        sex:'sex' in req.body?req.body.sex:data.sex,
        password:'password' in req.body?req.body.password:data.password,
        login:data.login
      }
      redis.set(key,userData)
      res.json(util.getReturnData(0,'change successfully'))
    }else{
      res.json(util.getReturnData(1,'change failed'))
    }
  })
}

exports.sendMail=(req,res,next)=>{
  let checkKey=req.headers.fapp+':user:info:'+req.params.username
  redis.get(checkKey).then((user)=>{
    console.log(checkKey)
    console.log(user)
    if(user&&req.body.text){
      let userKey1=req.headers.fapp+':user:'+req.username+':mail'
      let userKey2=req.headers.fapp+':user:'+req.params.username+':mail'
      let mailKey=req.headers.fapp+':mail:'
      redis.get(userKey1).then((mail)=>{
        if(mail==null) mail=[]
        let has=false
        for(let i=0;i<mail.length;i++){
          if(mail[i].users.indexOf(req.params.username)>-1){
            has=true
            mailKey=mailKey+mail[i].m_id
            redis.get(mailKey).then((mailData=[])=>{
              mailData.push({text:req.body.text,time:Date.now(),read:[]})
              redis.set(mailKey,mailData)
              res.json(util.getReturnData(0,'send message successfully'))
              next()
            })
          }
        }
        if(!has){
          redis.incr(mailKey).then((m_id)=>{
            mailKey=mailKey+m_id
            redis.set(mailKey,[{text:req.body.text,time:Data.now(),read:[]}])
            console.log({users:[req.params.username]})
            mail.push({m_id:m_id,users:[req.username,req.params.username]})
            redis.set(userKey1,mail)
            redis.get(userKey2).then((mail2)=>{
              if(!mail2) mail2=[]
              mail2.push({m_id:m_id,users:[req.username,req.params.username]})
              redis.set(userKey2,mail2)
              res.json(util.getReturnData(0,'send new message successfully'))
            })
          })
        }
      })
    }else{
      res.json(util.getReturnData(1,'user does not exist,send message failed'))
    }
  })
}

exports.getMails=(req,res,next)=>{
  let userKey1=req.headers.fapp+':user:'+req.username+':mail'
  /*
  redis.isExist(userKey1).then((exist)=>{
    console.log('exist')
    console.log(exist)
    if(exist === 0){
      redis.set(userKey1,{})
    }
  })*/
  redis.get(userKey1).then((mail)=>{
    res.json(util.getReturnData(0,'',mail))
  })
}

exports.gettoUserMail=(req,res,next)=>{
  let userKey1=req.headers.fapp+':user:'+req.username+':mail'
  let userKey2=req.headers.fapp+':user:'+req.body.username+':mail'
  let mailKey=req.headers.fapp+':mail:'
  let rData={}
  /*
  redis.isExist(userKey1).then((exist)=>{
    console.log('exist')
    console.log(exist)
    if(exist === 0){
      redis.set(userKey1,{})
    }
  })*/
  redis.get(userKey1).then((mail)=>{
    if(mail==null) mail=[]
    let has=false
    for(let i=0;i<mail.length;i++){
      //与目标用户存在历史消息，返回历史消息
      if(mail[i].users.indexOf(req.body.username)>-1){
        has=true
        //删除当前用户，确保users[0]取到的为目标用户
        mail[i].users.splice(mail[i].users.indexOf(req.username),1)
        rData.toUser=mail[i].users[0]
        let key=mailKey+mail[i].m_id
        redis.get(key).then((data)=>{
          console.log(data)
          if(data[data.length-1].read.indexOf(req.username)<0){
            data[data.length-1].read.push(req.username)
          }
          rData.mail=data
          redis.set(key,data)
          res.json(util.getReturnData(0,'',rData))
          next()
        })
        break
      }
    }
    
    if(!has){
      /*redis.isExist(mailKey).then((exist)=>{
        console.log('exist')
        console.log(exist)
        if(exist === 0){
          redis.set(mailKey,0)
        }
      })*/
      //与目标用户不存在历史消息，新建mail
      //del book:user:visitor:mail book:user:admin:mail book:mail:1 book:mail:
      redis.incr(mailKey).then((m_id)=>{
        mailKey=mailKey+m_id
        redis.set(mailKey,[{text:'',time:Date.now(),read:[]}])
        console.log({users:[req.body.username]})
        rData.toUser=req.body.username
        mail.push({m_id:m_id,users:[req.username,req.body.username]})
        redis.set(userKey1,mail)
        redis.get(userKey2).then((mail2)=>{
          if(!mail2) mail2=[]
          mail2.push({m_id:m_id,users:[req.username,req.body.username]})
          redis.set(userKey2,mail2)
          rData.mail=[{text:'',time:Date.now(),read:[]}]
          res.json(util.getReturnData(0,'',rData))
          //console.log('rDatatxta')
          //console.log(rData.mail.length)
          next()
        })
      })
    }
  })
}

exports.getUserMail=(req,res,next)=>{
  let userKey1=req.headers.fapp+':user:'+req.username+':mail'
  let rData={}
  redis.get(userKey1).then((mail)=>{
    if(!mail) res.json(util.getReturnData(0,'',[]))
    let has=false
    for(let i=0;i<mail.length;i++){
      if(mail[i].m_id==req.params.id){
        has=true
        mail[i].users.splice(mail[i].users.indexOf(req.username),1)
        rData.toUser=mail[i].users[0]
        let key=req.headers.fapp+':mail:'+req.params.id
        redis.get(key).then((data)=>{
          console.log(data)
          if(data[data.length-1].read.indexOf(req.username)<0){
            data[data.length-1].read.push(req.username)
          }
          rData.mail=data
          redis.set(key,data)
          res.json(util.getReturnData(0,'',rData))
          next()
        })
        break
      }
    }
    if(!has){
      res.json(util.getReturnData(1,'request error'))
    }
  })
}

exports.getArticleType=(req,res,next)=>{
  redis.get("book:a_type").then((data)=>{
    res.json(util.getReturnData(0,'',data))
  })
}

exports.articleLike=(req,res,next)=>{
  let member=req.headers.fapp+":article:"+req.params.id
  let like=req.params.like
  if(like==0){
    redis.zscore(req.headers.fapp+":a_like",member).then((data)=>{
      if(Number(data)>0){
        redis.zincrby(req.headers.fapp+":a_like",member,-1)
      }
    })
  }else{
    redis.zincrby(req.headers.fapp+":a_like",member)
  }
  res.json(util.getReturnData(0,'success'))
}

exports.articleCollection=(req,res,next)=>{
  let key=req.headers.fapp+":user:"+req.username+":collection"
  let a_key=req.headers.fapp+":article:"+req.params.id
  redis.get(a_key).then((data)=>{
    if(data){
      redis.get(key).then((tData)=>{
        if(!tData) tData=[]
        tData.push({time:Date.now(),a_id:req.params.id,title:data.title})
        redis.set(key,tData)
        res.json(util.getReturnData(0,'success'))
      })
    }else{
      res.json(util.getReturnData(1,'Article does not exist'))
    }
  })
}

exports.getCollection=(req,res,next)=>{
  let key=req.headers.fapp+":user:"+req.username+":collection"
  redis.get(key).then((data)=>{
    res.json(util.getReturnData(0,'',data))
  })
}