$(function() {
  $('#button1').click(function(event) {
    event.preventDefault();
    var username = $('#username').val();
    console.log(username);
    saveTweets(username);
  });
  setInterval(function(){
    saveTweetsForAllUsers();
  }, 10000);
});

function lastAvailableId(username) {
  var tweets = JSON.parse(localStorage.getItem(username));
  if (tweets && tweets.length > 0) {
    lastId = tweets[0]['id'];
  } else {
    lastId = -1
  }
  return lastId;
}

function saveData(username, data) {
  var tweets = convertDataToTweets(data);
  tweets.pop();
  showFlash(tweets.length.toString()+' tweets found!');
  var existingTweets = JSON.parse(localStorage.getItem(username));
  console.log(tweets);
  if (existingTweets) {
    var toStore = JSON.stringify(tweets.concat(existingTweets));
  } else {
    var toStore = JSON.stringify(tweets);
  }
  localStorage.setItem(username, toStore);
  showLastTweets(username);
}

function convertDataToTweets(data) {
  var tweets;
  tweets = [];
  $.each(data, function(i, v) {
    var tweet = {
      'id': v['id'],
      'text': v['text'],
      'created_at': v['created_at']
    };
    tweets.push(tweet);
  })
  return tweets
}

function showFlash(message) {
  var $flash = $('#flash');
  $flash.html(message);
}

function showLastTweets(username) {
  var 
    tweets = JSON.parse(localStorage.getItem(username)),
    section = $("<section id='"+username+"_tweets'></section>");
  $.each(tweets, function(k,v) {
    var
      // created_at = Date.parse(v['created_at']),
      article = $("<article id='tweet_"+v['id']+"'>"+v['text']+"</article>"),
      header = $("<header>Tweeted on <time>"+v['created_at']+"</time></header>");
    article.prepend(header);
    section.append(article);
  });
  $('#all_tweets').html(section);
}

function saveTweets(username) {
  var 
    tweet_url,
    lastId = lastAvailableId(username);
  if (lastId == -1) {
    tweet_url = 'https://twitter.com/statuses/user_timeline/'+username+'.json?count=3200';
  } else {
    tweet_url = 'https://twitter.com/statuses/user_timeline/'+username+'.json?since_id='+lastId;
  };
     
  $.ajax({
    url: tweet_url,
    dataType: 'jsonp',
    success: function(data) {
      // console.log("data", data)
      // $('#response').html(data[0]['text']);
      saveData(username, data);
      console.log('success'); 
    },
    // complete: function() {
    //   showFlash('completed!');
    // },
    error: function(jqXHR, textStatus, errorThrown) {
      // console.log("data", data)
      // $('#response').html(data[0]['text']);
      showFlash(textStatus);
    }
  })
}

function saveTweetsForAllUsers() {
  var usernames = Object.keys(localStorage);
  $.each(usernames, function(username) {
    saveTweets(username);
  })
}