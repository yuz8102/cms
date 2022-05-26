var express = require('express');
var router = express.Router();

var {setArticle}=require('../controller/admin')
var {showArticle}=require('../controller/admin')
var {setArticleType}=require('../controller/admin')
var {getAllUser}=require('../controller/admin')
var {stopLogin}=require('../controller/admin')
var {setIndexPic}=require('../controller/admin')
var {setNavMenu}=require('../controller/admin')
var {setFooter}=require('../controller/admin')
var {setLinks}=require('../controller/admin')

router.post('/setArticle',setArticle)
router.post('/showArticle',showArticle)
router.post('/setArticleType',setArticleType)
router.get('/getAllUser',getAllUser)
router.get('/stopLogin/:id',stopLogin)
router.post('/setIndexPic',setIndexPic)
router.post('/changeNav',setNavMenu)
router.post('/setFooter',setFooter)
router.post('/setLinks',setLinks)
module.exports=router