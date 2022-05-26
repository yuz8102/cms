let redis=require("../util/redisDB")
//导入模块，相当于import XXX
const util=require("../util/common")
const crypto = require('crypto')

exports.getNavMenu=(req,res,next)=>{
  let key=req.headers.fapp+":nav_menu"
  //data为then捕捉的resolve参数res，即数据库查询结果
  redis.get(key).then((data)=>{
    console.log(data)
    res.json(util.getReturnData(0,'',data))
  })
}

exports.getFooter=(req,res,next)=>{
  let key=req.headers.fapp+":footer"
  redis.get(key).then((data)=>{
    console.log(data)
    res.json(util.getReturnData(0,'',data))
  })
}

exports.getLinks=(req,res,next)=>{
  let key=req.headers.fapp+":links"
  redis.get(key).then((data)=>{
    console.log(data)
    res.json(util.getReturnData(0,'',data))
  })
}

exports.getIndexPic=(req,res,next)=>{
  let key=req.headers.fapp+":indexPic"
  redis.get(key).then((data)=>{
    console.log(data)
    res.json(util.getReturnData(0,'',data))
  })
}

exports.getHotArticle=(req,res,next)=>{
  let key=req.headers.fapp+":a_view"
  //含map循环，需要异步，取前5个
  redis.zrevrange(key,0,4).then(async (data)=>{
    let result=data.map((item) =>{
      return redis.get(item.member).then((data1)=>{
        if(data1&&data1.show!=0){
          return{
            'title':data1.title,
            //格式化时间戳
            'date':util.getLocalDate(data1.time),
            'id':data1.a_id,
            'view':item.score
          }
        }else{
          return{'title':'No Article Exists Now','date':'','id':0}
        }
      })
    })
    let t_data=await Promise.all(result)
    res.json(util.getReturnData(0,'',t_data))
  })
}

exports.getNewArticle=(req,res,next)=>{
  let key=req.headers.fapp+":a_time"
  let isAdmin=false
  console.log(key)
  if('token' in req.headers){
    let pKey=req.headers.fapp+":user:power:"+req.headers.token
    redis.get(pKey).then((powser)=>{
      console.log('power'+pKey+powser)
      //admin展示所有上线、未上线文章，其他，只展示上线
      if(powser=='admin'){
        //含map循环，需要异步
        redis.zrevrange(key,0,-1).then(async (data)=>{
          //console.log('new'+data)
          let result=data.map((item) =>{
            return redis.get(item.member).then((data1)=>{
              console.log(data1)
              if(data1){
                return{
                  'title':data1.title,
                  //格式化时间戳
                  'date':util.getLocalDate(item.score),
                  'id':data1.a_id,
                  'show':data1.show
                }
              }
            })
          })
          let t_data=await Promise.all(result)
          console.log(t_data)
          res.json(util.getReturnData(0,'',t_data))
        })
      }else{
        redis.zrevrange(key,0,-1).then(async(data)=>{
          console.log(data)
          let result=data.map((item)=>{
            return redis.get(item.member).then((data1)=>{
              if(data1&&data1.show!=0){
                return {'title':data1.title,'date':util.getLocalDate(item.score),'id':data1.a_id}
              }else{
                return {'title':'Article is not found','date':'','id':0}
              }
            })
          })
          let t_data=await Promise.all(result)
          res.json(util.getReturnData(0,'',t_data))
        })
      }
    })
  }else{
    redis.zrevrange(key,0,-1).then(async(data)=>{
      console.log(data)
      let result=data.map((item)=>{
        return redis.get(item.member).then((data1)=>{
          if(data1&&data1.show!=0){
            return {'title':data1.title,'date':util.getLocalDate(item.score),'id':data1.a_id}
          }else{
            return {'title':'Article is not found','date':'','id':0}
          }
        })
      })
      let t_data=await Promise.all(result)
      res.json(util.getReturnData(0,'',t_data))
    })
  }
}

exports.getArticle=(req,res,next)=>{
  let key=req.headers.fapp+":article:"+req.params.id
  redis.get(key).then((data)=>{
    if(data){
      if(data.show==1){
        redis.get(req.headers.fapp+":a_type").then((type)=>{
          type.map((item)=>{
            if(item.uid==data.type){
              data.typename=item.name
            }
          })
          redis.zscore(req.headers.fapp+":a_view",key).then((view)=>{
            console.log(view)
            data.view=view
            redis.zscore(req.headers.fapp+":a_like",key).then((like)=>{
              data.like=like
              res.json(util.getReturnData(0,'success',data))
            })
          })
        })
      }else{
        res.json(util.getReturnData(403,'The article has been deleted'))
      }
    }else{
      res,json(util.getReturnData(404,'File not exists'))
    }
  })
}

exports.getArticleTalk=(req,res,next)=>{
  let key=req.headers.fapp+":article:"+req.params.id+":talk"
  redis.get(key).then((data)=>{
    res.json(util.getReturnData(0,'success',data))
  })
}

exports.getArticles=(req,res,next)=>{
  let key=req.headers.fapp
  //标签采用md5
  if('tag' in req.body){
    let tKeyMd5=crypto.createHash('md5').update(req.body.tag).digest("hex")
    key=key+':tag:'+tKeyMd5
    console.log(key)
  }else if('type' in req.body){
    key=key+':a_type:'+req.body.type
    console.log(key)
  }else{
    res.json(util.getReturnData(1,'Parameters are wrong'))
    return
  }
  redis.get(key).then(async(data)=>{
    console.log(data)
    let result=data.map((item)=>{
      return redis.get(item).then((data1)=>{
        console.log(data1)
        if(data1&&data1.show!=0) {
          return {
            'title':data1.title,
            'date':util.getLocalDate(data1.time),'id':data1.a_id
          }
        }else{
          return{'title':'No article exists','date:':'','id':0}
        }
      })
    })
    let t_data=await Promise.all(result)
    res.json(util.getReturnData(0,'',t_data))
  })
}

exports.viewArticle=(req,res,next)=>{
  let key=req.headers.fapp+":article:"+req.params.id
  console.log('articleview')
  redis.zincrby(req.headers.fapp+':a_view',key)
  res.json(util.getReturnData(0,'success',))
}