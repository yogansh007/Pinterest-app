var express = require('express');
var router = express.Router();
var usermodel = require('./users');
var postmodel = require('./post');
const passport = require('passport');
const localStrategy = require('passport-local');
const multer = require('./multer')
passport.use(new localStrategy(usermodel.authenticate()));
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { nav: false });
});
router.post('/upload', isLoggedIn, multer.single("postImg"), async function (req, res) {
  const user = await usermodel.findOne({ username: req.session.passport.user });
  let post = await postmodel.create({
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename,
    user: user._id
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile');

});
router.get('/addpost', function (req, res, next) {
  res.render('post', { nav: true });
});

router.get('/profile', isLoggedIn, async function (req, res, next) {
  let user = await usermodel
    .findOne({ username: req.session.passport.user })
    .populate("posts");
    
  res.render('profile', { user, nav: true })
});

router.get('/show/posts', isLoggedIn, async function (req, res, next) {
  let user = await usermodel
    .findOne({ username: req.session.passport.user })
    .populate("posts");
    
  res.render('show', { user, nav: true })
});

router.get('/feed', isLoggedIn, async function (req, res, next) {
  let user = await usermodel
    .findOne({ username: req.session.passport.user })
   let posts= await postmodel.find()
   .populate("user")
    
  res.render('feed', { user,posts ,nav: true })
});

router.post('/fileupload', multer.single("file"), async function (req, res, next) {
  const user = await usermodel.findOne({ username: req.session.passport.user });
  user.image = req.file.filename;
  await user.save();
  res.redirect('./profile');
})

router.get('/register', function (req, res, next) {
  res.render('register', { nav: false });
});
router.post('/register', function (req, res) {
  const data = new usermodel({
    username: req.body.username,
    email: req.body.email,
    phone: req.body.phone_no,
    name:req.body.name
  });
  usermodel.register(data, req.body.password)
    .then(function () {
      passport.authenticate("local")(req, res, function () {
        res.redirect('/profile')
      })
    })
});

router.post('/login', passport.authenticate("local", {
  failureRedirect: "/",
  successRedirect: "/profile"
}));

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/')
}
module.exports = router;
