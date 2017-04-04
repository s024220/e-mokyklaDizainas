var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
   done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    shownNameField: 'showname',
    isTeacherField: 'role',
    passReqToCallback: true
}, function(req, email, password, showname, role, done){
    req.checkBody('email', 'Invalid email!').isEmail();
    req.checkBody('password', 'Invalid password, password to short!').isLength({min:4});
    req.checkBody('passwordRepeat', 'Passwords do not match!').equals(req.body.password);
    var errors = req.validationErrors();
    if (errors){
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email}, function (err, user) {
        if(err){
            return done(err);
        }
        if(user){
            return done(null, false, {message: 'Email is already in use!'});
        }
        var newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.showname = showname;
        newUser.isTeacher = role;
        newUser.save(function (err, result) {
            if (err){

                return done(err);
            }
            return done(null, newUser);
        });
    });
}));

passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    shownNameField: 'showname',
    isTeacherField: 'role',
    passReqToCallback: true
}, function(req, email, password, showname, role, done){
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty();
    var errors = req.validationErrors();
    if (errors){
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email}, function (err, user) {
        if(err){
            return done(err);
        }
        if(!user){
            return done(null, false, {message: 'No user with this username found!'});
        }
        if (!user.validPassword(password)) {
            return done(null, false, {message: 'Wrong password'});
        }
        return done(null, user);
    });
}));