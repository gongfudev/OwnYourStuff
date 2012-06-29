var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , mongooseAuth = require('mongoose-auth')
  , everyauth = require('everyauth')
  , conf = require('./conf')
  , Promise = everyauth.Promise;

var UserSchema = new Schema({});

UserSchema.plugin(mongooseAuth, {
  everymodule: {
    everyauth: {
      User: function () {
        return User;
        }
      }
    }  
  , facebook: {
      everyauth: {
          myHostname: 'http://localhost:3000'
        , appId: conf.fb.appId
        , appSecret: conf.fb.appSecret
        , redirectPath: '/'
      }
    }
  , twitter: {
      everyauth: {
          myHostname: 'http://localhost:3000'
        , consumerKey: conf.twit.consumerKey
        , consumerSecret: conf.twit.consumerSecret
        , redirectPath: '/'
      }
    }
  , password: {
        loginWith: 'email'
      // , extraParams: {
      //   twitterUsername: String
      //   }
      , everyauth: {
            getLoginPath: '/login'
          , postLoginPath: '/login'
          , loginView: 'login.jade'
          , getRegisterPath: '/register'
          , postRegisterPath: '/register'
          , registerView: 'register.jade'
          , loginSuccessRedirect: '/'
          , registerSuccessRedirect: '/'
        }  , github: {
      everyauth: {
          myHostname: 'http://localhost:3000'
        , appId: conf.github.appId
        , appSecret: conf.github.appSecret
        , redirectPath: '/'
      }
    }
  , instagram: {
      everyauth: {
          myHostname: 'http://localhost:3000'
        , appId: conf.instagram.clientId
        , appSecret: conf.instagram.clientSecret
        , redirectPath: '/'
      }
    }
  , google: {
      everyauth: {
          myHostname: 'http://localhost:3000'
        , appId: conf.google.clientId
        , appSecret: conf.google.clientSecret
        , redirectPath: '/'
        , scope: 'https://www.google.com/m8/feeds'
      }
    }
  }
});


module.exports = mongoose.model('User', UserSchema);