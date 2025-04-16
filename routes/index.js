var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./post');
const upload = require('./multer');
const passport = require('passport');

const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));


router.get('/', function(req, res, next) {
  res.render('index',{error : req.flash('error'),nav : false});
});

router.get('/profile',isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({username : req.session.passport.user}).populate('posts');
  res.render('profile',{user,nav:true});
});

router.get('/posts/show',isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({username : req.session.passport.user}).populate('posts');
  res.render('show',{user,nav:true});
});

router.get('/feed',isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({username : req.session.passport.user});
  const posts = await postModel.find().populate('user');
  res.render('feed',{user,posts,nav:true});
});

router.get('/add',isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({username : req.session.passport.user});
  res.render('add',{user,nav:true});
});

router.post('/fileupload',isLoggedIn,upload.single('image'),async function(req, res, next) {
  if(!req.file){
    return res.sendStatus(404).send('No file were uploaded');
  }
  const user = await userModel.findOne({username : req.session.passport.user});
  user.profileImg = req.file.filename;
  await user.save();
  res.redirect('/profile');
});

router.post('/createpost',isLoggedIn,upload.single('postimage'),async function(req, res, next) {
  if(!req.file){
    return res.sendStatus(404).send('No file were uploaded');
  }
  const user = await userModel.findOne({username : req.session.passport.user});
  const post = await postModel.create({
    user : user._id,
    title : req.body.title,
    description : req.body.description,
    image : req.file.filename
  })
  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile');
});

router.get('/register', function(req, res, next) {
  res.render('register',{nav : false});
});


router.post('/register', function(req, res, next) {
  const data = new userModel({
    username : req.body.username,
    fullname : req.body.fullname,
    email : req.body.email,
    contact : req.body.contact
  });

  userModel.register(data,req.body.password)
  .then(function(){
    passport.authenticate("local")(req,res,function(){
      res.redirect('/profile')
    });
  });
});

router.post('/login',passport.authenticate('local',{
  successRedirect : '/profile',
  failureRedirect : '/',
  failureFlash : true,
}),function(req, res, next) {});

router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/')
}


module.exports = router;
