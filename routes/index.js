var express = require('express');
var router = express.Router();

const userModel = require('./users');
const postModel = require('./post');
const upload = require('./multer');
const passport = require('passport');

const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));


// 🏠 HOME
router.get('/', function (req, res) {
  res.render('index', { nav: false });
});


// 👤 PROFILE
router.get('/profile', isLoggedIn, async function (req, res) {
  try {
    const user = await userModel
      .findById(req.user._id)
      .populate('posts');

    res.render('profile', { user, nav: true });
  } catch (err) {
    console.log(err);
    res.send("Error loading profile");
  }
});


// 📌 USER POSTS
router.get('/posts/show', isLoggedIn, async function (req, res) {
  try {
    const user = await userModel
      .findById(req.user._id)
      .populate('posts');

    res.render('show', { user, nav: true });
  } catch (err) {
    console.log(err);
    res.send("Error loading posts");
  }
});


// 🌍 FEED
router.get('/feed', isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findById(req.user._id);
    const posts = await postModel.find().populate('user');

    res.render('feed', { user, posts, nav: true });
  } catch (err) {
    console.log(err);
    res.send("Error loading feed");
  }
});


// 🔥 SINGLE POST (FIXED)
router.get('/post/:id', isLoggedIn, async function (req, res) {
  try {
    const post = await postModel.findById(req.params.id).populate('user');

    if (!post) {
      return res.send("Post not found");
    }

    res.render('post', { 
      post,
      user: req.user,
      nav: true
    });

  } catch (err) {
    console.log(err);
    res.send("Error loading post");
  }
});


// ❤️ LIKE
router.post('/like/:id', isLoggedIn, async function (req, res) {
  try {
    const post = await postModel.findById(req.params.id);
    const userId = req.user._id;

    if (post.likes.includes(userId)) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.redirect('back');

  } catch (err) {
    console.log(err);
    res.send("Like error");
  }
});


// 👤 PUBLIC PROFILE
router.get('/user/:username', isLoggedIn, async function (req, res) {
  try {
    const user = await userModel
      .findOne({ username: req.params.username })
      .populate('posts');

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect('back');
    }

    res.render('userProfile', { user, nav: true });

  } catch (err) {
    console.log(err);
    res.send("Error loading user profile");
  }
});


// 🔍 SEARCH
router.get('/search', isLoggedIn, async function (req, res) {
  try {
    const username = req.query.username;

    const user = await userModel.findOne({
      username: { $regex: new RegExp(username, "i") }
    });

    if (user) {
      return res.redirect(`/user/${user.username}`);
    }

    req.flash("error", "User not found 😢");
    return res.redirect('back');

  } catch (err) {
    console.log(err);
    res.send("Search error");
  }
});


// ➕ ADD PAGE
router.get('/add', isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findById(req.user._id);
    res.render('add', { user, nav: true });
  } catch (err) {
    console.log(err);
    res.send("Error loading page");
  }
});


// 📷 PROFILE IMAGE
router.post('/fileupload', isLoggedIn, upload.single('image'), async function (req, res) {
  try {
    if (!req.file) {
      req.flash("error", "No file uploaded");
      return res.redirect('back');
    }

    const user = await userModel.findById(req.user._id);
    user.profileImg = req.file.filename;
    await user.save();

    res.redirect('/profile');

  } catch (err) {
    console.log(err);
    res.send("Upload error");
  }
});


// 📝 CREATE POST
router.post('/createpost', isLoggedIn, upload.single('postimage'), async function (req, res) {
  try {
    if (!req.file) {
      req.flash("error", "No image selected");
      return res.redirect('/add');
    }

    const user = await userModel.findById(req.user._id);

    const post = await postModel.create({
      user: user._id,
      title: req.body.title,
      description: req.body.description,
      image: req.file.filename
    });

    user.posts.push(post._id);
    await user.save();

    res.redirect('/profile');

  } catch (err) {
    console.log(err);
    res.send("Post creation error");
  }
});

// 🗑 DELETE POST
router.post('/post/delete/:id', isLoggedIn, async function (req, res) {
  try {
    const post = await postModel.findById(req.params.id);

    if (!post) return res.send("Post not found");

    // 🔐 owner check
    if (post.user.toString() !== req.user._id.toString()) {
      return res.send("Unauthorized");
    }

    // user se remove
    await userModel.findByIdAndUpdate(post.user, {
      $pull: { posts: post._id }
    });

    // post delete
    await postModel.findByIdAndDelete(req.params.id);

    res.redirect('/profile');

  } catch (err) {
    console.log(err);
    res.send("Delete error");
  }
});


// 📄 REGISTER PAGE
router.get('/register', function (req, res) {
  res.render('register', { nav: false });
});


// 🧾 REGISTER
router.post('/register', async function (req, res) {
  try {
    const { username, fullname, email, contact, password } = req.body;

    if (!username || !fullname || !email || !password) {
      req.flash("error", "All fields are required");
      return res.redirect('/register');
    }

    if (password.length < 4) {
      req.flash("error", "Password must be at least 4 characters");
      return res.redirect('/register');
    }

    const existingUser = await userModel.findOne({ username });
    if (existingUser) {
      req.flash("error", "Username already exists");
      return res.redirect('/register');
    }

    const user = new userModel({
      username,
      fullname,
      email,
      contact
    });

    await userModel.register(user, password);

    passport.authenticate("local")(req, res, function () {
      res.redirect('/profile');
    });

  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong");
    res.redirect('/register');
  }
});


// 🔐 LOGIN
router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/feed',
    failureRedirect: '/',
    failureFlash: true,
  })
);


// 🚪 LOGOUT
router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});


// 🔒 AUTH CHECK
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports = router;