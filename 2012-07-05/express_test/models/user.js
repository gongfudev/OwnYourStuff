var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    mongooseAuth = require('mongoose-auth'),
    everyauth = require('everyauth'),
    conf = require('../conf'),
    Promise = everyauth.Promise;

var UserSchema = new Schema({});

UserSchema.plugin(mongooseAuth, {
  everymodule: {
    everyauth: {
      User: function() {
        return User;
      }
    }
  },
  facebook: {
    everyauth: {
      myHostname: 'http://localhost:3000',
      appId: conf.fb.appId,
      appSecret: conf.fb.appSecret,
      redirectPath: '/'
    }
  },
  twitter: {
    everyauth: {
      myHostname: 'http://localhost:3000',
      consumerKey: conf.twit.consumerKey,
      consumerSecret: conf.twit.consumerSecret,
      redirectPath: '/',
      findOrCreateUser: function(session, accessTok, accessTokExtra, twitterUser) {
        var promise = this.Promise()
          , User = this.User()();
        User.findById(session.auth.userId, function(err, user) {
          if (err) {return promise.fail(err)};
          if (!user) {
            User.where('email', twitterUser.email).findOne(function(err, user) {
              if (err) {return promise.fail(err)};
              if (!user) {
                User.createWithTwitter(twitterUser, accessTok, accessTokExtra.expires, function(err, createdUser) {
                  if (err) {return promise.fail(err)};
                  return promise.fulfill(createdUser);
                });
              } else {
                assignTwitterDataToUser(user, accessTok, accessTokExtra, twitterUser);
                user.save(function(err, user) {
                  if (err) return promise.fail(err);
                  promise.fulfill(user);
                });
              }
            });
          } else {
            assignTwitterDataToUser(user, accessTok, accessTokExtra, twitterUser);
  
            // Save the new data to the user doc in the db
            user.save(function(err, user) {
              if (err) return promise.fail(err);
              promise.fulfill(user);
            });
          }
        });
        return promise; // Make sure to return the promise that promises the user
      }
    }
  },
  // twitter: {
  //   everyauth: {
  //     myHostname: 'http://localhost:3000',
  //     consumerKey: conf.twit.consumerKey,
  //     consumerSecret: conf.twit.consumerSecret,
  //     redirectPath: '/',
  //     findOrCreateUser: function(session, accessTok, accessTokExtra, TwitterUser) {
  //   };
  //   return promise; // Make sure to return the promise that promises the user
  // },
  password: {
    loginWith: 'email',
    extraParams: {
      twitterScreenName: String,
      avatarUrl: String,
      tweets: []
    },
    everyauth: {
      getLoginPath: '/login',
      postLoginPath: '/login',
      loginView: 'login.jade',
      getRegisterPath: '/register',
      postRegisterPath: '/register',
      registerView: 'register.jade',
      loginSuccessRedirect: '/',
      registerSuccessRedirect: '/'
    }
  },
  github: {
    everyauth: {
      myHostname: 'http://localhost:3000',
      appId: conf.github.appId,
      appSecret: conf.github.appSecret,
      redirectPath: '/'
    }
  },
  instagram: {
    everyauth: {
      myHostname: 'http://localhost:3000',
      appId: conf.instagram.clientId,
      appSecret: conf.instagram.clientSecret,
      redirectPath: '/'
    }
  },
  google: {
    everyauth: {
      myHostname: 'http://localhost:3000',
      appId: conf.google.clientId,
      appSecret: conf.google.clientSecret,
      redirectPath: '/',
      scope: 'https://www.google.com/m8/feeds'
    }
  }
});

UserSchema.pre('set', function (next, path, val, typel) {
  // `this` is the current Document
  this.emit('set', path, val);

  // Pass control to the next pre
  next();
});

module.exports = mongoose.model('User', UserSchema);
// 
// 
// UserSchema.plugin(mongooseAuth, {
//   facebook: {
//     everyauth: {
//         myHostname: ...
//       , ...
//       , findOrCreateUser: function (session, accessTok, accessTokExtra, fbUser) {
//           var promise = this.Promise()
//               , User = this.User()();
//           User.findById(session.auth.userId, function (err, user) {
//             if (err) return promise.fail(err);
//             if (!user) {
//               User.where('password.login', fbUser.email).findOne( function (err, user) {
//                 if (err) return promise.fail(err);
//                 if (!user) {
//                   User.createWithFB(fbUser, accessTok, accessTokExtra.expires, function (err, createdUser) {
//                     if (err) return promise.fail(err);
//                     return promise.fulfill(createdUser);
//                   });
//                 } else {
//                   assignFbDataToUser(user, accessTok, accessTokExtra, fbUser);
//                   user.save( function (err, user) {
//                     if (err) return promise.fail(err);
//                     promise.fulfill(user);
//                   });
//                 }
//               });
//             } else {
//               assignFbDataToUser(user, accessTok, accessTokExtra, fbUser);
// 
//               // Save the new data to the user doc in the db
//               user.save( function (err, user) {
//                 if (err) return promise.fail(err);
//                 promise.fuilfill(user);
//               });
//             }
//           });
//         });
//         return promise; // Make sure to return the promise that promises the user
//       }
//   }
// });
// Assign all properties - see lib/modules/facebook/schema.js for details


function assignTwitterDataToUser(user, accessTok, accessTokExtra, twitterUser) {
  console.log("twitterUser", twitterUser);
  user.twit.accessToken = accessTok;
  user.twit.expires = accessTokExtra.expires;
  user.twit.id = twitterUser.id;
  user.twit.screenName = twitterUser.screen_name;
  user.twit.name = twitterUser.name;
  user.twitterScreenName = twitterUser.screen_name;
  user.avatarUrl = twitterUser.profile_image_url;
  // user.avatarUrl = twitterUser.profile_image_url;
}
