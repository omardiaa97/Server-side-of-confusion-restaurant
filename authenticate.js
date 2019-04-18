var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var facebookTokenStrategy = require('passport-facebook-token');

var config = require('./config.js');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = function(req, res, next) {
    User.findOne({_id: req.user._id})
        .then((user) => {
            console.log("User: ", req.user);
            user.admin = true;
            if (user.admin) {
                next();
            }
            else {
                err = new Error('You are not authorized to perform this operation!');
                err.status = 403;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err))
};

exports.facebookStrategy = passport.use(new facebookTokenStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret
}, (accessToken, refreshToken, profile, done) =>{
    user.findOne({facebookId: profile.id}, (err, user) =>{
        if(err) return done(err, false);
        if(!err && user!==null) return done(null, user);
        else {
            user = new User({username: profile.displayName});
            username.facebookId = profile.id;
            username.firstname = profile.givenName;
            username.lastname = profile.familyName;
            user.save((err, user) =>{
                if (err) return done(err, false);
                else done(null, user);
            })
        }
    })
}))