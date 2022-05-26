let redis=require("../util/redisDB")
//导入模块，相当于import XXX
const util=require("../util/common")
const crypto = require('crypto')

exports.setArticle=(req,res,next)=>{
  let data=req.body.article
  data.show=0
  console.log(data)
  let key=''
  if('a_id' in req.body.article){
    key=req.headers.fapp+":article:"+req.body.article.a_id
    redis.set(key,data)
    res.json(util.getReturnData(0,'change successfully'))
    return
  }else{
    //新文章需要初始化点赞数0、观看数0和时间戳
    data.time=Date.now()
    key=req.headers.fapp+":article:"
    redis.incr(key).then((id)=>{
      data.a_id=id
      key=key+id
      //存文章，json类型
      redis.set(key,data)
      //文章key加到分类列表
      let a_type=data.type
      redis.get(req.headers.fapp+":a_type:"+a_type).then((data1)=>{
        if(!data1){
          data1=[]
        }
        data1.push(key)
        redis.set(req.headers.fapp+":a_type:"+a_type,data1)
      })
      //文章key加到标签列表
      let tags=data.tag
      tags.map((item)=>{
        let tKeyMd5=crypto.createHash('md5').update(item).digest("hex")
        console.log(tKeyMd5)
        redis.get(req.headers.fapp+':tag:'+tKeyMd5).then((data1)=>{
          if(!data1){
            data1=[]
          }
          data1.push(key)
          redis.set(req.headers.fapp+":tag:"+tKeyMd5,data1)
        })
      })
      redis.zadd(req.headers.fapp+':a_time',key,Date.now())
      redis.zadd(req.headers.fapp+':a_view',key,0)
      redis.zadd(req.headers.fapp+':a_like',key,0)
      res.json(util.getReturnData(0,'Create New Article successfully'))
    })
  }
}

exports.showArticle=(req,res,next)=>{
  let key=req.headers.fapp+":article:"+req.body.a_id
  redis.get(key).then((data)=>{
    if(!data) res.json(util.getReturnData(404,'Can not find this article'))
    if(data.show==1){
      data.show=0
    }else{
      data.show=1
    }
    redis.set(key,data)
  })
  res.json(util.getReturnData(0,'Change successfully'))
}

exports.setArticleType=(req,res,next)=>{
  let data=req.body.type
  console.log(data)
  let key=req.headers.fapp+':a_type'
  redis.set(key, data)
  data.map((item)=>{
    console.log(item.uid)
    let tKey=req.headers.fapp+':a_type:'+item.uid
    redis.get(tKey).then((data1)=>{
      if(!data1){
        redis.set(tKey,[])
      }
    })
  })
  res.json(util.getReturnData(0,'Create type successfully'))
}

exports.getAllUser=(req,res,next)=>{
  let re=req.headers.fapp+':user:info:*'
  redis.scan(re).then(async(data)=>{
    let result=data[1].map((item)=>{
      return redis.get(item).then((user)=>{
        return {'username':user.username,'login':user.login,'ip':user.ip}
      })
    })
    let t_data=await Promise.all(result)
    res.json(util.getReturnData(0,'',t_data))
  })
}

exports.stopLogin=(req,res,next)=>{
  let key=reeq.headers.fapp+':user:info:'+req.params.id
  redis.get(key).then((user)=>{
    if(user.login==0){
      user.login=1
    }else{
      user.login=0
    }
    redis.set(key,user)
    res.json(util.getReturnData(0,'change successfully'))
  })
}

exports.setIndexPic=(req,res,next)=>{
  let key=req.headers.fapp+":indexPic"
  console.log(req.body)
  let data=req.body.indexPic
  console.log(data)
  redis.set(key,data)
  res.json(util.getReturnData(0,'change successfully'))
}

exports.setNavMenu=(req,res,next)=>{
  let key=req.headers.fapp+":nav_menu"
  let data=req.body.nav_menu
  console.log(data)
  redis.set(key,data)
  res.json(util.getReturnData(0,'change successfully'))
}

exports.setFooter=(req,res,next)=>{
  let key=req.headers.fapp+":footer"
  let data=req.body.footer
  console.log(data)
  redis.set(key,data)
  res.json(util.getReturnData(0,'change successfully'))
}

exports.setLinks=(req,res,next)=>{
  let key=req.headers.fapp+":links"
  let data=req.body.links
  console.log(data)
  redis.set(key,data)
  res.json(util.getReturnData(0,'change successfully'))
}