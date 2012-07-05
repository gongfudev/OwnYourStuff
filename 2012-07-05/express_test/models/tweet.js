// morphed from http://www.fusioncube.net/index.php/node-js-basics-and-twitter-search
// by @rudifa
// require Node modules
var http = require('http'),
  url = require("url"),
  path = require("path"),
  fs = require("fs"),
  events = require("events"),
  util = require("util"),
  mongo = require("mongodb"),
  twitter = require('ntwitter'),
  db = new mongo.Db("tweets", new mongo.Server('localhost', 27017, {}), {});
  
db.open(function(){});

var twit = new twitter({
  consumer_key: 'X26tudngkaeSS1BxRkR5g',
  consumer_secret: 'eyUjdfeznmE2zpSuT7IgQLDMPPk3MTbnN64JvkM4vo',
  access_token_key: '7128662-5VhRs6uGQ5i5YtR1UUrYUVD6G3lytNPBNAXh1guAvA',
  access_token_secret: 'I0WmqdZ4aCZ5yf8iXGiuSamStUvCZW6XeaTnLVLw7hM'
});

twit.stream('statuses/user_timeline', function(stream) {
  stream.on('data', function (data) {
    console.log(data);
  });
});

/**
 * Serve a static web file
 * 
 * @param {Object} uri
 * @param {Object} response
 */
function serve_static_web_file(uri, response) {
  if (uri == '/') {
    uri = '/index.html';
  }
  var filename = path.join(process.cwd(), uri);

  console.log("serve_static_web_file: " + uri);
  //console.log("serve_static_web_file " + filename);

  // If file exists send it to the client
  path.exists(filename, function (exists) {

    if (!exists) {
      // File not found: return a 404 error.
      response.writeHead(404, {
        "Content-Type": "text/plain"
      });
      response.write("No such file " + uri);
      response.end();
      return;
    }

    // File exists: read it.
    fs.readFile(filename, "binary", function (err, file) {

      if (err) {
        // File read failed: return a 500 error.
        response.writeHead(500, {
          "Content-Type": "text/plain"
        });
        response.write(err + "\n");
        response.end();
        return;
      }

      // File was read: return a 200 header and the file as binary data.
      response.writeHead(200);
      response.write(file, "binary");
      response.end();
    });
  });
}

// Server state and event emitter
var Twitter = (function () {
  var eventEmitter = new events.EventEmitter();

  return {
    EventEmitter: eventEmitter,
    oldest_id: 0,
    // The ID of the oldest tweet received so far
    current_user: ''
  };
})();

/**
 * Get tweets for username
 * 
 * @param {Object} query
 */
function get_tweets_from_twitter(username) {
  

  var options = {
    host: "api.twitter.com",
    port: 80,
    method: "GET",
    path: "/1/statuses/user_timeline.json?screen_name=" + username + "&count=5"
  };
  if (Twitter.oldest_id > 0) {
    options.path += "&max_id=" + Twitter.oldest_id;
  }

  console.log("get_tweets_from_twitter: " + options.host + options.path);

  // Send a request to Twitter
  var request = http.request(options)

  // register listener for event 'response'
  .on("response", function (response) {
    var body = "";

    response.on("data", function (data) {
      // append data received from Twitter
      body += data;
      //console.log('data : body.length=', body.length);
    });

    response.on("end", function (data) {
      console.log('end : body.length=', body.length);

      try {
        // parse the response data
        console.log('body', body);
        var tweets = JSON.parse(body);
        
        console.log('tweets.length=', tweets.length);

        if (tweets.length > 0) {

          // got some tweets
          console.log('got some tweets, tweets.length=', tweets.length);

          var newest_id = tweets[0]['id'];
          var oldest_id = tweets[tweets.length - 1]['id'];

          if (newest_id == Twitter.oldest_id) {
            // remove it to avoid repetition
            tweets.shift();
          }
          if (tweets.length > 0) {

            // remember the id
            Twitter.oldest_id = oldest_id;
            console.log('broadcast ');

            // broadcast the event 'tweets' to listeners if any
            Twitter.EventEmitter.emit("tweets", tweets);
            
            db.collection('collection', function(err, collection){
              collection.insert(tweets, function(){
              console.log('doc inserted')
              })
            })
            
          }
        }

        // remove any previous listeners
        //Twitter.EventEmitter.removeAllListeners("tweets");
      } catch (ex) {
        console.log("get_tweets_from_twitter: bad JSON data: " + body);
      }
    });
  });

  // End the request
  request.end();
}

/**
 * Create a HTTP server listening on port 8888
 * 
 * @param {Object} request
 * @param {Object} response
 */
http.createServer(function (request, response) {
  // Parse the entire URI to get just the pathname
  var uri = url.parse(request.url).pathname;

  //console.log('createServer ' + util.inspect(request));
  console.log('createServer cb uri:' + uri);
  console.log('createServer cb query:' + request.url.split("?")[1]);


  if (uri === "/twitter") {
    // user is requesting tweets

    // if no response within timeout: return empty JSON array
    var timeout = setTimeout(function () {
      response.writeHead(200, {
        "Content-Type": "text/plain"
      });
      response.write(JSON.stringify([]));
      response.end();
    }, 5000);

    // Register a listener for the 'tweets' (emitted in get_tweets_from_twitter() when tweets are received). 
    Twitter.EventEmitter.once("tweets", function (tweets) {
      //console.log('createServer function(tweets)' + util.inspect(tweets));

      // Send the tweets json string back to the client
      response.writeHead(200, {
        "Content-Type": "text/plain"
      });
      response.write(JSON.stringify(tweets));
      response.end();

      // Stop the timeout function from completing (see below)
      //clearTimeout(timeout);
    });

    // Parse out the username
    var username = request.url.split("?")[1];

    if (Twitter.current_user != username) {
      Twitter.current_user = username;
      Twitter.oldest_id = 0;
    }

    // Search for tweets with the search term
    get_tweets_from_twitter(username);

    /*
     * For all other requests, try to return a static page by calling the 
     * serve_static_web_file() function.
     */
  } else {
    serve_static_web_file(uri, response);
  }
}).listen(8888);

// Put a message in the console verifying that the HTTP server is up and running
console.log("Server running at http://127.0.0.1:8888/");