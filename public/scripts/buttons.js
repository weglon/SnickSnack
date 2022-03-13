let menuOpened = false;

function logout() {
  localStorage.setItem("token", "");
  window.location.href = "/login";
}

function showClientPosts() {
  $("#feed_name").html('<i class="lni lni-fireworks"></i>Your Posts');
  $("#feed_nav_left").css("opacity", "0.2");
  $("#feed_nav_right").css("opacity", "1");
  $("#feed_div").css("margin-right", "0px");
  $("#posts_div").css("margin-left", "900px");
}

$("#feed_nav_left").click(() => {
  showClientPosts();
});

$("#feed_nav_right").click(() => {
  $("#feed_name").html('<i class="lni lni-star-filled"></i>New Posts');
  $("#feed_nav_right").css("opacity", "0.2");
  $("#feed_nav_left").css("opacity", "1");
  $("#posts_div").css("margin-left", "0px");
  $("#feed_div").css("margin-right", "900px");
});

function addRequests() {
  requests = client.requests;

  console.log(requests);
  for (let i = 0; i < requests.length; i++) {
    let r = requests[i];
    console.log(r);
    $("#requests_div").append(
      `<div><h3>${r.username}</h3><button id="accept_friend_button" onclick="handleRequest('${r.userid}', true)"><i class="lni lni-checkmark-circle"></i></button><button id="deny_friend_button" onclick="handleRequest('${r.userid}', false)"><i class="lni lni-cross-circle"></i></button>`
    );
  }
}

$("#save_post").click(function () {
  const title = $("#post_title_input").val();
  const content = $("#post_content_input").val();

  if (title.includes("¶") || content.includes("¶")) return;
  if (!title && !content) return;

  localStorage.setItem("saved_post", `${title}¶${content}`);
  closeCollapseAnimation("#post_input_div", "#new_post_button");
});

$("#discard_post").click(function () {
  closeCollapseAnimation("#post_input_div", "#new_post_button");
  localStorage.setItem("saved_post", "");
  $("#post_title_input").val("");
  $("#post_content_input").val("");
});

$("#submit_post").click(function () {
  const title = $("#post_title_input").val();
  const content = $("#post_content_input").val();
  const token = localStorage.getItem("token");

  // Verify everything locally
  if (title.length > 200) {
    $("#post_input_div #error").text("Title is to long. < 200 characters");
    return;
  }
  if (content.length > 1000) {
    $("#post_input_div #error").text("Post is to long. 1000 < characters");
    return;
  }
  if (!content && !title) {
    $("#post_input_div #error").text(
      "Atleast one of the fields needs to be filled out"
    );
  }
  if (!token) {
    window.location.href = "/login";
    return;
  }

  $.ajax({
    url: "/api/addpost",
    type: "POST",
    data: JSON.stringify({ token, title, content }),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (data) {
      console.log(data);
      if (data.status === "error") {
        $("#post_input_div #error").text(data.msg);
        if (href) {
          window.location.href = data.href;
          return;
        }
        return;
      } else if (data.status === "ok") {
        console.log(data);
        closeCollapseAnimation("#post_input_div", "#new_post_button");
        $("#post_input_div input, textarea").val("");
        addPosts(data.posts, "#posts_div");
        showClientPosts();
        return;
      }
    },
  });
});

$("#menu").click(function () {
  if (!menuOpened) {
    $("#menu").css("rotate", "90deg");
    $(".menu").css("left", "0px");
    menuOpened = true;
  } else {
    $("#menu").css("rotate", "0deg");
    $(".menu").css("left", "-390px");
    menuOpened = false;
  }
});

$("#new_post_button").click(function () {
  openCollapseAnimation("#post_input_div", "400px", "#new_post_button");
});

$("#add_friend").click(function () {
  $("#friend_overlay").css("visibility", "visible");
});

$("#search_friend").click(function () {
  let query = $("#search_input").val();
  if (validateUsername(query)) {
    $.ajax({
      url: "/api/searchuser",
      type: "POST",
      data: JSON.stringify({ username: query }),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function (data) {
        if (data.status === "ok") {
          console.log("yo" + data);
          usr = $("#friend_overlay_container").html(
            `<div id="friend_info_div"><i class='${data.profile.image}' id='profile_pic' style='background-color: ${data.profile.color}'></i><h2>${data.username}</h2></div><p id="error"></p><button onclick="addUser('${data.id}')"><i class="lni lni-circle-plus"></i>Add</button>`
          );
        } else if (data.status === "error") $("#error").html(data.msg);
      },
    });
  } else {
    $("#error").html(
      "Username cant contain any special characters and symbols"
    );
  }
});

function changePage(to, from) {
  window.location.href = "#";
  $(from).css("opacity", "0");
  $(from).css("visibility", "hidden");
  $(to).css("visibility", "visible");
  $(to).css("opacity", "1");
}

function addUser(id) {
  let token = localStorage.getItem("token");
  console.log(id, token);
  if (!token || token === "") {
    //window.location.href = "/login";
  }

  $.ajax({
    url: "/api/addfriendrequest",
    type: "POST",
    data: JSON.stringify({ id, token }),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (data) {
      if (data.status === "ok") {
        window.location.href = data.href;
      } else if (data.status === "error") window.location.href = data.href;
    },
  });
}
