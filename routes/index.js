var express = require('express');
var app = express;
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var User = require('../models/user');

require('../config/passport');

var csrfProtection = csrf();
router.use(csrfProtection);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('e-mokykla/index', { title: 'E-mokykla' });
});

router.get('/user/updateProfile', function(req, res, next) {
    res.render('user/updateProfile');
});

router.get('/user/signup', function(req, res, next){
    var messages = req.flash('error');
    res.render('user/signup', {csrfToken: req.csrfToken(), messages: messages,
        hasErrors: messages.length > 0})
});

router.post('/user/signup', passport.authenticate('local.signup',{
    successRedirect: '/user/signup2',
    failureRedirect: '/user/signup',
    failureFlash: true
}));

router.param('id', function(req,res,next,id){
    user.findById(id, function(err, docs){
        if(err) res.json(err);
        else
        {
            req.userId = docs;
            next();
        }
    });
});

router.post('/user/profile', function(req, res, next){
    User.findByIdAndUpdate({_id: req.user.id},
        {
            email: req.user.email,
            password: req.user.password,
            showname: req.body.showname,
            isTeacher: req.user.isTeacher
        }, function(err, docs){
            if(err){
                console.log('im here');
                res.json(err);
            }
            else
            {
                console.log(docs);
                res.redirect('/user/profile');
            }
        });
});

router.get('/user/profile/', function(req, res, next){
    res.render('user/profile', { csrfToken: req.csrfToken(), username: req.user.showname, id: req.user.id });
});

router.get('/user/signin', function(req, res, next){
    var messages = req.flash('error');
    res.render('user/signin', {csrfToken: req.csrfToken(), messages: messages,
        hasErrors: messages.length > 0})
});

router.post('/user/signin', passport.authenticate('local.signin',{
    successRedirect: '/user/profile',
    failureRedirect: '/user/signin',
    failureFlash: true
}));

router.get('/user/signup2/', function(req, res, next){
    res.render('user/signup2', {csrfToken: req.csrfToken()});
});

router.post('/user/signup2', function(req, res, next){
    User.findByIdAndUpdate({_id: req.user.id},
        {
            email: req.user.email,
            password: req.user.password,
            showname: req.user.showname,
            isTeacher: req.body.isTeacher
        }, function(err, docs){
            if(err){
                console.log('im here');
                res.json(err);
            }
            else
            {
                console.log(docs);
                res.redirect('/user/signupFinal');
            }
        });
});

router.get('/user/signupFinal/', function(req, res, next){
    res.render('user/signupFinal', { csrfToken: req.csrfToken(), username: req.user.showname, email: req.user.email });
});

router.post('/user/signupFinal', function(req, res, next){
    res.redirect("/user/signin");
});

//router.get('/user/profile', function(req, res){
//    res.render('user/profile', );
//});

module.exports = router;
