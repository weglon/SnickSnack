let client = null;

function setPage() {
  // checks for saved posts
  const saved_post = localStorage.getItem("saved_post");
  if (saved_post) {
    const title = saved_post.split("¶")[0];
    const content = saved_post.split("¶")[1];
    $("#post_title_input").val(title);
    $("#post_content_input").text(content);
    openCollapseAnimation("#post_input_div", "400px", "#new_post_button");
  }

  for (let i = 0; i < client.posts; i++) {
    getPostDiv(client.posts[i]);
  }

  getFriends();
  addRequests();
  getUserDiv();

  const feed = getShuffledFeed(client.feed);
  addPosts(feed, "#feed_div");
  addPosts(client.posts, "#posts_div");
  createEditorWindow("#profile_editor_div");
}

function addPosts(posts, div) {
  $(div).html("");
  $(div).append("<div class='spacer'></div>");
  for (let i = posts.length - 1; i >= 0; i--) {
    let p = posts[i];

    let title = jQuery("<h2>", { text: p.title, class: "title" });
    let content = jQuery("<p>", { text: p.content, class: "content" });
    let author = null;

    if (client.username === p.author.username) {
      author = jQuery("<p>", {
        text: "Written by you",
      });
    } else {
      author = jQuery("<a>", {
        text: `by: ${p.author.username}`,
        class: "link",
        href: "#",
        onclick: `loadUserPosts('${p.author.userid}')`,
      });
    }
    let date = jQuery("<p>", {
      text: p.time.substring(0, 10) + " " + p.time.substring(11, 16),
      class: "date",
    });

    jQuery("<div>", {
      append: [title, content, date, author],
    }).appendTo(div);
  }
}

function getFriends() {
  const friends = client.friends;
  if (friends.length > 0) {
    for (let i = 0; i < friends.length; i++) {
      let f = friends[i];
      $("#friends_div").append(
        `<div id="friend_info_div" onclick="loadUserPosts('${f.userid}')"><i class="${f.profile.image}" style="background-color: ${f.profile.color}" id="profile_pic"></i><h2>${f.username}</h2></div>`
      );
    }
  } else {
    $("#friends_div").html(
      "<p>You dont have any friends yet, but you can add some below</p>"
    );
  }
}

function checkLogin() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
    return;
  }

  $.ajax({
    url: "/api/gethome",
    type: "POST",
    data: JSON.stringify({ token }),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (data) {
      if (data.status === "ok") {
        client = data;
        setPage(data);
      } else if (data.status === "error") window.location.href = data.href;
    },
  });
}
