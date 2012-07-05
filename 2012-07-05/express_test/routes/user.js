exports.account = function(req, res){
  res.render('account', { user: req.user, title: "Account of user "+req.user.name});
};

exports.logout = function (req, res) {
    req.logout();
    res.redirect('/');
};