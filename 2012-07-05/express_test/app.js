var express = require('express')
  , request = require('request')
  , mongoose = require('mongoose')
  , mongooseAuth = require('mongoose-auth')
  , url = require('url')
  , util = require('util')
  , twits = require('./save/tweets.js')
  , site = require('./routes/site.js')
  , user = require('./routes/user.js');  // 
    // , twyts = require(__dirname+'/save/tweets');

require(__dirname+'/models/user');


mongoose.connect('mongodb://localhost:27017/ownYourStuff');

User = mongoose.model('User');

var app = express.createServer(
    express.bodyParser()
  , express.static(__dirname + "/public")
  , express.cookieParser()
  , express.session({ secret: 'esoognom'})
  , mongooseAuth.middleware()
);

app.configure( function () {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.get('/', site.index);

app.get('/logout', user.logout);

app.get('/account', user.account);


mongooseAuth.helpExpress(app);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
  
  var userStream = User.find().stream();

  userStream.on('data', function (user) {
    if(user!=null && user.twit){
      console.log("user twitter data:", user.twit);
      // twyts.get_tweets_from_twitter(user);
    }
  })

  userStream.on('error', function (err) {
    // handle err
  })

  userStream.on('close', function () {
    // all done
  })
});