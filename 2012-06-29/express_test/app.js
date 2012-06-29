var express = require('express')
  , routes = require('./routes')
  , request = require('request')
  , mongoose = require('mongoose')
  , mongooseAuth = require('mongoose-auth')
  , url = require('url')
  , util = require('util');
  // , db = new mongo.Db("own_your_stuff", new mongo.Server('localhost', 27017, {}), {});
  

require('./user.js');

mongoose.connect('mongodb://localhost:27017/ownYourStuff');
// db.open(function(){});

User = mongoose.model('User');
  
// var users = [
//     { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com' }
//   , { id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com' }
// ];

// var app = module.exports = express.createServer();

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

app.get('/', function (req, res) {
  var user = new User();
  user.email = 'yannisjaquet@mac.com';
  console.log("user:", user);
  user.save(function (err) {
    console.log("User.saved?", err)
  });
  res.render('home');
});

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/account', function(req, res){
  res.render('account', { user: req.user, title: "Account of user "+req.user.name});
});

mongooseAuth.helpExpress(app);

// app.listen(3000);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});