const express=require("express")
const dotenv=require('dotenv')
dotenv.config()
require('./passport-setup')
const app=express()
const passport=require("passport")
const session=require('express-session')
const facebookStrategy=require('passport-facebook').Strategy
const User=require('./models/User')




app.set("view engine","ejs")
app.use(express.static("views"));
app.use(session({secret:"thesecretkey"}))
app.use(passport.initialize())
app.use(passport.session());
app.get("/",(req,res)=>{
    res.render('index.ejs')
})

passport.use(new facebookStrategy({

// pull in our app id and secret from our env file///////////////////////////////////////
    clientID        : process.env.FACEBOOK_CLIENT_ID,
    clientSecret    : process.env.FACEBOOK_SECRET_ID,
    callbackURL     : process.env.FACEBOOK_CALLBACK_URL,
    profileFields   : ['id','displayName','name','gender','picture.type(large)','email']

},// facebook will send back the token and profile///////////////////////////////////////////
function(token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {
            User.findOne({ 'uid' : profile.id }, function(err, user) {
                if (err)
                    return done(err);
                if (user) {
                    console.log(user)
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser=new User();
    
                    // set all of the facebook information in our user model
                    newUser.uid    = profile.id; // set the users facebook id                   
                    newUser.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                    newUser.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                    newUser.pic = profile.photos[0].value
                    // save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
    
            });
    
        })
    
    }));
    
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    
   
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
    
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('loggedin.ejs',{name:req.user['name']})
    });
    
   
    function isLoggedIn(req, res, next) {
    
        if (req.isAuthenticated())
            return next();
    
        res.redirect('/');
    }
    
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
    
    app.get('/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));
    
    app.get('/',(req,res) => {
        res.render("index")
    })
    app.get('/good', isLoggedIn, (req, res) =>{
        res.render("loggedin.ejs",{name:req.user['displayName']})
    })
    
    // Auth Routes
    app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    
    app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/good');
      }
    );
    app.listen(5000,() => {
        console.log("App is listening on Port 5000......")
    })
