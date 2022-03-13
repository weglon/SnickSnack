const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const colors = ["#99BBAD", "#9A8194", "#FF6363", "#FFAB76"];
const images = [
  "lni lni-sad",
  "lni lni-happy",
  "lni lni-cool",
  "lni lni-friendly",
  "lni lni-smile",
  "lni lni-speechless",
  "lni lni-suspect",
  "lni lni-suspect",
  "lni lni-tounge",
  "lni lni-pizza",
  "lni lni-heart",
  "lni lni-eye",
  "lni lni-infinite",
  "lni lni-baloon",
  "lni lni-crown",
  "lni lni-cloud",
  "lni lni-night",
  "lni lni-sun",
  "lni lni-star",
  "lni lni-paperclip",
];

const userSchema = new Schema(
  {
    username: { type: String, uppcase: false, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    feed: [],
    friends: [
      {
        userid: Schema.Types.ObjectId,
        username: String,
        profile: { image: String, color: String },
      },
    ],
    posts: [
      {
        title: String,
        content: String,
        time: Date,
        author: { username: String, userid: Schema.Types.ObjectId },
        likes: [Schema.Types.ObjectId],
        comments: [{ username: String, content: String }],
      },
    ],
    friendRequests: [{ username: String, userid: Schema.Types.ObjectId }],
    createdAt: { type: Date, value: new Date() },
    profile: {
      image: String,
      color: String,
      desc: String,
      lastActive: Date,
    },
  },
  { collection: "users" }
);

const model = mongoose.model("userSchema", userSchema);

async function addFriendRequest(usr, f_usr) {
  f_usr.friendRequests.push({
    username: usr.username,
    userid: usr._id,
  });

  await f_usr.save();
}

async function addPost(usr, con, tit) {
  post = {
    title: tit,
    content: con,
    time: new Date(),
    author: { username: usr.username, userid: usr._id },
    likes: [],
    comments: [],
  };

  await model.updateOne({ _id: usr._id }, { $push: { posts: post } });
}

async function addFeed(usr) {
  scope = 4;
  await model.updateOne({ _id: usr._id }, { $set: { feed: [] } });
  await usr.friends.forEach(async function (friend) {
    let f = await model.findById(friend.userid);
    if (f.posts.length > 0 && f.posts.length <= scope) {
      await model.updateOne({ _id: usr._id }, { $push: { feed: f.posts } });
    } else if (f.posts.length > scope) {
      let addArr = f.posts.slice(f.posts.length - scope, f.posts.length);
      await model.updateOne({ _id: usr._id }, { $push: { feed: addArr } });
    }
  });
}

async function addFriend(usr, f_usr) {
  usr.friends.push({
    username: f_usr.username,
    userid: f_usr._id,
    profile: { image: f_usr.profile.image, color: f_usr.profile.color },
  });
  f_usr.friends.push({
    username: usr.username,
    userid: usr._id,
    profile: { image: usr.profile.image, color: usr.profile.color },
  });

  await usr.save();
  await f_usr.save();
}

module.exports = {
  user: model,
  addFriend,
  addPost,
  addFeed,
  addFriendRequest,
  images,
  colors,
};
