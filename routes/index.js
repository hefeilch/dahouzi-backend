var express = require('express');
var router = express.Router();
var pool = require('../pool');
var sql = require('../sql');

router.get('/', function (req, res, next) {
    // res.render('main/index', {title: 'Express'});
    res.send('Hello World')
});
router.get('/login', function (req, res, next) {
    res.render('main/login', {title: 'Express'});
});
router.get('/regist', function (req, res, next) {
    res.render('main/regist', {title: 'Express'});
});
router.get('/validateNickName', function (req, res, next) {
    res.render('main/regist', {title: 'Express'});
});
router.get('/validateEmail', function (req, res, next) {
    res.render('main/regist', {title: 'Express'});
});
router.get('/validateCode', function (req, res, next) {
    res.render('main/regist', {title: 'Express'});
});
router.post('/doRegist.do', function (req, res, next) {
    var nickname = req.body.nickname;
    var email = req.body.email;
    var password = req.body.password;
    var valicode = req.body.valicode;
    console.log('nickname:' + nickname);
    console.log('email:' + email);
    console.log('password:' + password);
    console.log('valicode:' + valicode);
    console.log('pool:' + pool);
    console.log('sql:' + sql.addMember);

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
            connection.query(sql.insertMember, [nickname, email, password], function (err, result) {
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
                    connection.release();
                    res.render('main/message', {title: '注册成功', detail: '打开邮箱，激活账户'});
                });
            });
        });
    });

});
router.post('/doLogin.do', function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    console.log('email:' + email);
    console.log('password:' + password);
    pool.getConnection(function (err, connection) {
        console.log('err:' + err);
        if (err) {
            console.error('error connecting: ' + err.stack);
            //return;
            //throw err;
        }

        connection.query(sql.selectMemberById, [email, password], function (err, rows) {
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

module.exports = router;
