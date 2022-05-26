let util={}
util.getReturnData=(code,message='',data=[])=>{
  //确保空值被转成数组
  if (!data) {
    data=[]
  }
  //多于一条语句用return
  return {code:code,message:message,data:data}
}
util.getLocalDate=(t)=>{
  let date=new Date(parseInt(t))
  return date.getFullYear()+"-"+(parseInt(date.getMonth())+1)+"-"+date.getDate()+" "
  +date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
}
module.exports=util