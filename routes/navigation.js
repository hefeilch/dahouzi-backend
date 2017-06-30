/**
 * Created by CH on 2016/3/22.
 */
var express = require('express');
var router = express.Router();
var http = require('http');
var URL = require('url');
var fs = require('fs');
var cheerio = require('cheerio');
var pool = require('../pool');
var sql = require('../sql');

router.get('/', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        console.log('err:' + err);
        if (err) {
            console.error('error connecting: ' + err.stack);
            throw err;
        }

        connection.query(sql.selectPrimeClassAll, function (err, rows1) {
            if (err) {
                throw err;
            }
            connection.query(sql.selectClassAll, function (err, rows2) {
                if (err) {
                    throw err;
                }

                var rendData = [];

                for (var i = 0; i < rows1.length; i++) {
                    var primeClass = {
                        primeClassId: rows1[i]['clas_id'],
                        primeClassTitle: rows1[i]['clas_title'],
                        subClasses: []
                    };
                    for (var j = 0; j < rows2.length; j++) {
                        if (primeClass.primeClassId == rows2[j]['clas_prime_id']) {
                            primeClass.subClasses.push({
                                subClassId: rows2[j]['clas_id'],
                                subClassTitle: rows2[j]['clas_title']
                            })
                        }
                    }
                    rendData.push(primeClass);
                }
                console.log('rendData:' + JSON.stringify(rendData));
                connection.release();
                res.render('navigation/navigation', {rendData: rendData});
            });

        });
    });
});
router.post('/selectPrimeClass', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        console.log('err:' + err);
        if (err) {
            console.error('error connecting: ' + err.stack);
            //return;
            //throw err;
        }

        connection.query(sql.selectPrimeClassAll, function (err, rows) {
            if (err) {
                return connection.rollback(function () {
                    throw err;
                });
            }
            connection.release();
            res.send({result: true, data: rows});
        });
    });
});
router.post('/selectSubClass', function (req, res, next) {
    var primeId = req.body.primeId;
    console.log('primeId:' + primeId);
    pool.getConnection(function (err, connection) {
        console.log('err:' + err);
        if (err) {
            console.error('error connecting: ' + err.stack);
            //return;
            //throw err;
        }

        connection.query(sql.selectSubClassByPrimeClassId, primeId, function (err, rows) {
            if (err) {
                return connection.rollback(function () {
                    throw err;
                });
            }
            connection.release();
            res.send({result: true, data: rows});
        });
    });
});
router.post('/addNavi.do', function (req, res, next) {
    var naviLink = req.body.naviLink;
    var classId = req.body.classId;
    var isPrior = req.body.isPrior ? 1 : 0;
    var memberId = 7;
    var title,favicon = '',author, keywords, description;
    console.log('naviLink:' + naviLink);
    console.log('classId:' + classId);
    console.log('isPrior:' + isPrior);
    if (!naviLink) {
        return;
    }
    http.get(naviLink, function (_res) {
        var source = "";
        //通过 get 请求获取网页代码 source
        _res.on('data', function (data) {
            source += data;
        });
        //获取到数据 source，我们可以对数据进行操作了!
        _res.on('end', function () {
            var $ = cheerio.load(source);
            title = $('title').text();
            for (var i = 0; i < $('meta').length; i++) {
                var meta = $('meta')[i];
                console.log('meta：' + $(meta).attr('name'));
                var metaName = $(meta).attr('name');
                switch (metaName) {
                    case 'author':
                        author = $(meta).attr('value');
                        break;
                    case 'keywords':
                        keywords = $(meta).attr('value');
                        break;
                    case 'description':
                        description = $(meta).attr('value');
                        break;
                }
            }
            var faviconUrl = '';
            for (var j = 0; j < $('link').length; j++) {
                var link = $('link')[j];
                var linkRel = $(link).attr('rel');
                if (linkRel == 'shortcut icon' || linkRel == 'bookmark') {
                    faviconUrl = $(link).attr('href');
                    break;
                }
            }
            var parsedNaviLink = URL.parse(naviLink);
            if (faviconUrl && faviconUrl.charAt(0) == '/') {
                faviconUrl = 'http://' + parsedNaviLink.host + faviconUrl;
            } else if (faviconUrl && faviconUrl.charAt(0) != '/') {
                faviconUrl = 'http://' + parsedNaviLink.host + parsedNaviLink.pathname + faviconUrl;
            }
            pool.getConnection(function (err, connection) {
                console.log('err:' + err);
                if (err) {
                    console.error('error connecting: ' + err.stack);
                    //return;
                    //throw err;
                }
                connection.beginTransaction(function (err) {
                    if (err) {
                        throw err;
                    }
                    connection.query(sql.insertNavigator, [naviLink,faviconUrl,title , author, description, keywords, isPrior], function (err, rows) {
                        if (err) {
                            return connection.rollback(function () {
                                throw err;
                            });
                        }
                        connection.commit(function (err) {
                            if (err) {
                                return connection.rollback(function () {
                                    throw err;
                                });
                            }
                            console.log('row:' + rows.length);
                            connection.release();
                            res.redirect('/navigation');
                        });

                    });

                });


            });
        });
    }).on('error', function () {
        console.log("获取数据出现错误");
    });

    return;

});


module.exports = router;
