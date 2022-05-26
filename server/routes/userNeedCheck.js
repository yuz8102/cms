var express = require('express');
var router = express.Router();

var {getUserInfo}=require('../controller/userNeedCheck')
var {changeUserInfo}=require('../controller/userNeedCheck')
var {sendMail}=require('../controller/userNeedCheck')
var {getMails}=require('../controller/userNeedCheck')
var {getUserMail}=require('../controller/userNeedCheck')
var {gettoUserMail}=require('../controller/userNeedCheck')
var {getArticleType}=require('../controller/userNeedCheck')
var {articleLike}=require('../controller/userNeedCheck')
var {articleCollection}=require('../controller/userNeedCheck')
var {getCollection}=require('../controller/userNeedCheck')

router.get('/info/:username',getUserInfo)
router.post('/changeInfo',changeUserInfo)
router.post('/mail/:username',sendMail)
router.get('/mailsGet',getMails)
router.get('/mailGetter/:id',getUserMail)
router.post('/mailToUser',gettoUserMail)
router.get('/getArticleType',getArticleType)
router.get('/like/:id/:like',articleLike)
router.get('/save/:id',articleCollection)
router.get('/saveList',getCollection)
module.exports = router