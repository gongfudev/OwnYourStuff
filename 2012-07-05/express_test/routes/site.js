var twyts = require('../save/tweets')
/*
 * GET home page.
 */

exports.index = function(req, res){
  if (req.user && req.user.twitterScreenName) {
    console.log('user authenticated twitter screen name: ', req.user.twitterScreenName);
    twyts.get_tweets_from_twitter(req.user);
  };
  res.render('home', { title: 'Express' })
};