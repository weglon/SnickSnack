const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtkey = "____";
const {
  user,
  addFriend,
  addFriendRequest,
  addPost,
  addFeed,
  images,
  colors,
} = require("./models/user");

module.exports = async (app) => {
  // Landing page
  app.post("/api/gethome", async (req, res) => {
    const { token } = req.body;

    if (!token) {
      console.log("unrecognizable token");
      return res.json({ status: "error", href: "login" });
    }

    try {
      const v_usr = await getUserFromToken(token);
      await addFeed(v_usr);

      return res.json({
        status: "ok",
        username: v_usr.username,
        requests: v_usr.friendRequests,
        friends: v_usr.friends,
        feed: v_usr.feed,
        requests: v_usr.friendRequests,
        profile: v_usr.profile,
        posts: v_usr.posts,
      });
    } catch (e) {
      console.log("unrecognizable token");
      return res.json({ status: "error", href: "login" });
    }
  });

  app.post("/api/getfeed", async (req, res) => {
    const { token } = req.body;
    if (!token) return res.json({ status: "error", href: "/login" });
    try {
      const usr = await getUserFromToken(token);
      await addFeed(usr);

      return res.json({ status: "ok", feed: usr.feed });
    } catch (e) {}
  });

  app.post("/api/verifyfriendrequest", async (req, res) => {
    const { id, token, accept } = req.body;

    if (!token) {
      return res.json({ status: "ok", href: "/login" });
    }

    try {
      const v_usr = await getUserFromToken(token);
      const f_usr = await user.findById(id);

      let currReq;
      for (let i = 0; i < v_usr.friendRequests.length; i++) {
        let r = v_usr.friendRequests[i];
        if (r.userid.equals(f_usr._id)) {
          currReq = r;
        }
      }

      if (accept && currReq != null) {
        await addFriend(v_usr, f_usr);

        v_usr.friendRequests.remove(currReq);
        await v_usr.save();

        return res.json({ status: "ok", href: "/" });
      } else if (!accept && currReq != null) {
        v_usr.friendRequests.remove(currReq);
        await v_usr.save();
        return res.json({ status: "ok", href: "/" });
      }
    } catch (e) {
      return res.json({ status: "error", href: "/login" });
    }
  });

  app.post("/api/addfriendrequest", async (req, res) => {
    const { id, token } = req.body;
    if (!token) {
      console.log(token, id);
      return res.json({ status: "error", href: "/login" });
    }

    try {
      const v_usr = await getUserFromToken(token);
      const f_usr = await user.findById(id);

      if (v_usr.friendRequests.some((r) => r.userid.equals(f_usr._id))) {
        console.log("Already have request");
        return res.json({
          status: "error",
          msg: "You've already sent a friend request to this user",
          href: "/",
        });
      }

      if (f_usr.friendRequests.some((r) => r.userid.equals(v_usr._id))) {
        console.log("Already sent request");
        return res.json({
          status: "error",
          msg: "You already have a request from this user",
          href: "/",
        });
      }

      if (f_usr.friends.some((f) => f.userid.equals(v_usr._id))) {
        console.log("Already friends");
        return res.json({ status: "error", href: "/" });
      }

      await addFriendRequest(v_usr, f_usr);
      return res.json({ status: "ok", href: "/" });
    } catch (e) {
      console.log(e);
      return res.json({ status: "error", href: "/login" });
    }
  });

  app.post("/api/getfriend", async (req, res) => {
    const { f_id, token } = req.body;

    if (!token || !f_id) return res.json({ status: "error", href: "/login" });

    try {
      const usr = await getUserFromToken(token);
      const f_usr = await user.findById(f_id);

      if (usr.friends.some((f) => f.userid == f_id)) {
        return res.json({
          status: "ok",
          username: f_usr.username,
          profile: f_usr.profile,
          posts: f_usr.posts,
        });
      }
      return res.json({
        status: "error",
        msg: "Your not friends with this person",
        href: "/",
      });
    } catch (e) {
      return res.json({ status: "error", href: "/login" });
    }
  });

  // Searching for a user in the db, by name from client
  app.post("/api/searchuser", async (req, res) => {
    const username = req.body.username;
    try {
      user.findOne(
        { username: new RegExp("^" + username + "$", "i") },
        function (err, doc) {
          if (doc === null || err) {
            return res.json({
              status: "error",
              msg: "Couldn't find a user by that name'",
            });
          }
          return res.json({
            status: "ok",
            username: doc.username,
            id: doc._id,
            profile: doc.profile,
          });
        }
      );
    } catch (e) {
      return res.json({
        status: error,
        msg: "Something went wrong",
      });
    }
  });

  // Add a new post
  app.post("/api/addpost", async (req, res) => {
    const { token, title, content } = req.body;

    if (title.length > 200) {
      return res.json({ status: "error", msg: "Title is < 200 characters" });
    }
    if (content.length > 1000) {
      return res.json({ status: "error", msg: "Post is < 1000 characters" });
    }
    if (!content && !title) {
      return res.json({ status: "error", msg: "Both fields are empty" });
    }

    try {
      // Get the user though their jwt and update their post-list
      const v_usr = await getUserFromToken(token);
      await addPost(v_usr, content, title);

      // Get the updated postlist and send it back to the user
      const up_usr = await user.findOne({ _id: v_usr._id });
      const p = up_usr.posts;

      return res.json({ status: "ok", posts: p });
    } catch (e) {
      return res.json({ status: "error", href: "Something went wrong" });
    }

    return res.json({ status: "Aye booo" });
  });

  // Login
  app.post("/api/login", async (req, res) => {
    const { username: v_usrnm, password } = req.body;

    if (!v_usrnm || typeof v_usrnm !== "string")
      return res.json({ status: "error", msg: "username invalid" });
    if (!password || typeof password != "string")
      return res.json({ status: "error", msg: "password invalid" });

    const username = v_usrnm.toLowerCase();
    const v_usr = await user.findOne({ username }).lean();

    if (!v_usr) {
      res.json({ status: "error", msg: "Incorrect username or password" });
      return;
    }
    if (await bcrypt.compare(password, v_usr.password)) {
      const secret = jwt.sign(
        {
          id: v_usr._id,
        },
        jwtkey
      );

      await addFeed(v_usr);
      res.json({ status: "ok", token: secret, href: "/" });
    } else res.json({ status: "error", msg: "Incorrect username or password" });
  });

  // Password change
  app.post("/api/changepass", async (req, res) => {
    const { token, password } = req.body;

    if (!password || typeof password != "string")
      return res.json({ status: "error", msg: "password invalid" });

    try {
      const v_usr = jwt.verify(token, jwtkey);
      const h_pass = await bcrypt.hash(password, 12);
      await user.updateOne({ _id: v_usr.id }, { $set: { password: h_pass } });
    } catch (e) {
      return res.json({ status: "error", msg: "..." });
    }
    return res.json({ status: "ok", href: "/login" });
  });

  app.post("/api/editprofile", async (req, res) => {
    const { token, image, color, desc } = req.body;
    console.log(!token, !image, !color, !desc);

    if (!token || !image || !color || !desc) {
      console.log("Something is wrong here in /api/editprofile");
      return res.json({ status: "error", msg: "...", href: "/login" });
    }

    try {
      let usr = await getUserFromToken(token);
      usr.profile = { image, color, desc, lastActive: new Date() };
      await usr.save();

      return res.json({ status: "ok", href: "/" });
    } catch (e) {
      console.log("Unusual request sent in /api/editprofile");
      return res.json({ status: "error", msg: "...", href: "/login" });
    }
  });

  // Register
  app.post("/api/register", async (req, res) => {
    user.find().exec(function (err, result) {
      if (err)
        return res.json({ status: "error", msg: "Something went wrong" });
      if (result.length > 100) {
        return res.json({
          status: "error",
          msg: "This website just allows a small number of users at the moment and has sadly reached it's limit. Check back in a week or so, the capacity might have grown",
        });
      }
      console.log(result.length);
    });

    // Saves data from client in a temporary object
    const { username: usrnm, email, password: pass } = req.body;

    console.log(usrnm);
    // Checks if aawaitll the information is correct
    if (!usrnm || typeof usrnm !== "string")
      return res.json({ status: "error", msg: "username invalid" });
    if (!pass || typeof pass != "string")
      return res.json({ status: "error", msg: "password invalid" });
    if (!validateEmail(email))
      return res.json({ status: "error", msg: "password invalid" });
    if (!usrnm || typeof usrnm !== "string")
      return res.json({ status: "error", msg: "password invalid" });

    // Encrypts password
    const password = await bcrypt.hash(pass, 12);

    // Saves lowercase username
    let username = usrnm.toLowerCase();

    const profile = {
      image: images[Math.floor(Math.random() * images.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      desc: `${username}'s Account`,
      lastActive: new Date(),
    };

    // Adds new user within a try-catch statement
    try {
      const v_usr = await user.create({
        username,
        email,
        password,
        profile,
      });

      console.log(`Added new user ${v_usr}`);
      // Sends response
      return res.json({
        status: "ok",
        href: "/login",
      });
    } catch (e) {
      if (e.code === 11000) {
        return res.json({
          status: "error",
          msg: "Email or username already in use",
        });
      } else throw e;
    }

    return res.json({ status: "ok", href: "/login" });
  });

  async function getUserFromToken(token) {
    const v_usr = await user.findById(jwt.verify(token, jwtkey).id);
    v_usr.profile.lastActive = new Date();
    await v_usr.save();

    return v_usr;
  }

  // Helper function to verify email
  function validateEmail(email) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return true;
    } else return false;
  }
};
