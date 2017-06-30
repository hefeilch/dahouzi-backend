/**
 * Created by CH on 2016/3/22.
 */
var express = require('express');
var router = express.Router();
var pool = require('../pool');
var sql = require('../sql');

router.get('/info', function (req, res, next) {
    res.render('setting/setting-info', {title: 'Express'});
});
router.get('/class', function (req, res, next) {
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
                res.render('setting/setting-class', {rendData: rendData});
            });

        });
    });
});
router.post('/addClass.do', function (req, res, next) {
    var title = req.body.title;
    var primeId = req.body.primeId;
    var memberId = 7;
    console.log('title:' + title);
    console.log('primeId:' + primeId);
    console.log('memberId:' + memberId);
    pool.getConnection(function (err, connection) {
        console.log('err:' + err);
        if (err) {
            console.error('error connecting: ' + err.stack);
            //return;
            //throw err;
        }

        connection.query(sql.insertClass, [title, primeId, memberId], function (err, rows) {
            if (err) {
                return connection.rollback(function () {
                    throw err;
                });
            }
            console.log('row:' + rows.length);
            connection.release();
            res.redirect('class');
        });
    });
});

module.exports = router;
