var http = require('http');
  
//Create a client (need to pass it these values??)
var client = http.createClient(80, 'stream.twitter.com');
var tweets = client.request("GET", '/statuses/user_timeline', {
  "Host":"stream.twitter.com",
  "Authorization":"Basic " + new Buffer('yannis_:twitter2375$').toString('base64'),
  "User-Agent":"Twitter-Node"
});