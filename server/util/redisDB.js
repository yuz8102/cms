/*******************封装数据库方法，将存储对象定义为JSON（除有序集外），redis4.0以上支持**********************/
let redis = require("redis");
//获取配置
const {redisConfig} = require("../config/db");
//获取连接
const redis_client = redis.createClient(redisConfig);
redis_client.on("connect",()=>{
  console.log("connect success")
});
redis_client.on("error",(err)=>{
  console.log(err)
});

redis={};

redis.isExist = async (key)=>{
  let exist = await new Promise((resolve)=>{
    redis_client.exists(key,(err,res)=>{
      console.log(err)
      return resolve(res)
    })
  })
  return exist
}
//从游标cursor开始，匹配正则模式re的元素，返回元素数量为count
//resolve传给then，reject传给catch
keys = async (cursor,re,count)=>{
  let getTempKeys = await new Promise((resolve)=>{
    redis_client.scan([cursor,"MATCH",re,"COUNT",count],(err,res)=>{
      console.log(err);
      //resolve被then捕捉，且不再执行{}内剩余代码
      return resolve(res);
    })
  })
  return getTempKeys;
}
//搜索键值
redis.scan = async (re,cursor = 0,count = 100)=>{
  return await keys(cursor,re,count)
}
//set方法，保存到redis
redis.set = (key,value) => {
  value = JSON.stringify(value);
  return redis_client.set(key,value,(err)=>{
    if (err) {
      console.log(err);
    }
  })
}
//获取键值对应数据
text = async (key) => {
  let getTempValue = await new Promise((resolve)=>{
    redis_client.get(key,(err,res)=>{
      //
      return resolve(res);
    })
  })
  getTempValue=JSON.parse(getTempValue);
  return getTempValue;
}
//get方法，异步执行，获取键值对应数据
redis.get=async(key)=>{
  return await text(key);
}

//设置用户token过期时间
redis.expire=(key,ttl)=>{
  redis_client.expire(key,parseInt(ttl))
}

//自增ID，键值key对应的数值加1
id=async (key)=>{
  console.log("search"+key)
  let id = await new Promise((resolve=>{
    redis_client.incr(key,(err,res)=>{
      console.log(res);
      return resolve(res)
    })
  }))
  console.log(id)
  return id
}
//键值对应存储数值加1
redis.incr=async (key)=>{
  return await id(key)
}

//新建redis有序集,实现热度排序
//键值、成员、分值
//封装zadd,zadd添加成员到有序集key，key不存在时自动新建有序集
redis.zadd=(key,member,num)=>{
  member=JSON.stringify(member)
  console.log(member)
  redis_client.zadd(key,num,member,(err)=>{
    if(err){
      console.log(err)
    }
  })
}
//封装zrevrange，返回>=min&<=max下标的成员及分值，按分值递减排序（不使用withscores则递增）
//将json对象转化为js对象，并与对应score共同封装为js对象
tempData=async(key,min,max)=>{
  let tData=await new Promise((resolve=>{
    redis_client.zrevrange([key,min,max,'WITHSCORES'],(err,res)=>{
      return resolve(res)
    })
  }))
  let oData=[]
  for (let i = 0; i < tData.length; i=i+2) {
    //tdata中第i位为第i+1个成员，第i+1位为对应分值
    oData.push({member:JSON.parse(tData[i]),score:tData[i+1]})
  }
  return oData
}
redis.zrevrange=async (key,min=0,max=-1)=>{
  return tempData(key,min,max)
}
//封装zincrby，给member的分值加上NUM，针对有序集
redis.zincrby=(key,member,NUM=1)=>{
  member=JSON.stringify(member);
  redis_client.zincrby(key,NUM,member,(err)=>{
    if(err) console.log(err)
  })
}
//封装zscore，返回分数值
tempZscore = async (key,member)=>{
  member=JSON.stringify(member)
  return await new Promise((resolve=>{
    redis_client.zscore(key,member,(err,res)=>{
      console.log(typeof(res))
      return resolve(res)
    })
  }))
}
redis.zscore=async(key,member)=>{
  return tempZscore(key,member)
}
module.exports=redis;
