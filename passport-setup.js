const passport = require('passport');
const User=require('./models/User')
const GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback:true
  },
  function(request, accessToken, refreshToken, profile, done) {
    const user=new User({
        uid:profile['id'],
        name:profile['displayName'],
        email:profile['email']

    })
    user.save().then().catch()
    return done(null, profile);
  }
));