var express = require('express');
var router = express.Router();
//const util=require("../util/common")
var {getNavMenu}=require('../controller/getData')
var {getFooter}=require('../controller/getData')
var {getLinks}=require('../controller/getData')
var {getIndexPic}=require('../controller/getData')
var {getHotArticle} = require('../controller/getData')
var {getNewArticle } = require('../controller/getData')
var {getArticle} = require('../controller/getData')
var {getArticleTalk} = require('../controller/getData')
var {getArticles} = require('../controller/getData')
var {viewArticle}=require('../controller/getData')
const util=require('../util/common')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/getFooter',getFooter);
router.get('/getLinks',getLinks)
router.get('/getNavMenu',getNavMenu)
router.get('/getIndexPic',getIndexPic)
router.get('/getHotArticle',getHotArticle)
router.get('/getNewArticle',getNewArticle)
router.get('/getArticle/:id',getArticle)
router.get('/getArticleTalk/:id',getArticleTalk)
router.post('/getArticles',getArticles)
router.get('/viewArticle/:id',viewArticle)

module.exports = router;
