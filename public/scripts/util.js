function getUserDiv() {
  const u = client;
  console.log(u.profile);
  $("#user_info_div").html(
    `<i class="${u.profile.image}" style="background-color: ${u.profile.color}" id="profile_pic"></i><h2>${u.username}</h2>`
  );
}

function getShuffledFeed(arr) {
  let array = [];
  let return_array = [];

  while (array.length < arr.length) {
    let r = Math.floor(Math.random() * arr.length);
    if (!array.includes(r)) {
      array.push(r);
    }
  }

  for (let i = 0; i < array.length; i++) {
    return_array.push(arr[array[i]]);
  }

  return return_array;
}

function viewFriendsProfile(friend) {
  console.log("yo im bo");
  const p_name = jQuery("<h1>", { text: friend.username, class: "username" });
  const p_img = jQuery("<i>", {
    class: friend.profile.image,
    style: `background-color: ${friend.profile.color}`,
    id: "profile_pic",
  });
  const p_header = jQuery("<div>", {
    class: "header",
    append: [p_img, p_name],
  });
  const p_desc = jQuery("<p>", {
    class: "description",
    text: friend.profile.desc,
  });
  const p_info = jQuery("<p>", {
    class: "info",
    text: `Last seen: ${friend.profile.lastActive}`,
  });
  const p_info_div = jQuery("<div>", {
    class: "information_div",
    append: [p_header, p_desc, p_info],
  });

  $("#profile_div").html([p_header, p_info_div]);
  $("#user_posts_title").text(`${friend.username}'s Posts`);
  addPosts(friend.posts, "#user_posts");

  changePage("#view_user_container", ".maincontainer");
}

function handleRequest(id, accept) {
  const token = localStorage.getItem("token");
  if (!id || !token) window.location.href = "/login";

  $.ajax({
    url: "/api/verifyfriendrequest",
    type: "POST",
    data: JSON.stringify({ id, token, accept }),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (data) {
      if (data.status === "ok") {
        window.location.href = data.href;
      } else if (data.status === "error");
      window.location.href = data.href;
    },
  });
}

function getFeed() {
  const token = localStorage.getItem("token");

  if (!token) window.location.href = "/login";
  console.log("Getting feed");

  $.ajax({
    url: "/api/getfeed",
    type: "POST",
    data: JSON.stringify({ token }),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (data) {
      if (data.status === "ok") {
        client.feed = data;
        setPage();
      } else if (data.status === "error") window.location.href = data.href;
    },
  });
}

function openCollapseAnimation(elemId, height, removeId) {
  if (removeId != "") {
    $(removeId).css("opacity", "0");
    $(removeId).css("visibility", "hidden");
  }
  $(elemId).css("visibility", "visible");
  $(elemId).css("opacity", "1");
  $(elemId).css("height", height);
}

function closeCollapseAnimation(elemId, removeId) {
  $(elemId).css("height", "0px");
  $(elemId).css("opacity", "0");
  $(elemId).css("visibility", "hidden");
  if (removeId != "") {
    $(removeId).css("visibility", "visible");
    $(removeId).css("opacity", "1");
  }
}

function loadUserPosts(f_id) {
  const token = localStorage.getItem("token");

  if (!f_id || !token) {
    return;
  }

  $.ajax({
    url: "/api/getfriend",
    type: "POST",
    data: JSON.stringify({ f_id, token }),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (data) {
      if (data.status === "ok") {
        viewFriendsProfile(data);
      } else if (data.status === "error") window.location.href = data.href;
    },
  });
}

function validateEmail(email) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return true;
  } else return false;
}

function validateUsername(str) {
  return !/[~`!#$%\^&*+=\\ [\]\\';,/{}|\\":<>\?]/g.test(str);
}
