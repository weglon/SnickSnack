function openConvo(index) {
  console.log(index);
}

function startConvo(index, id) {
  let token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
    return;
  }

  $.ajax({
    url: "/api/newConvo",
    type: "POST",
    data: JSON.stringify({token, id}),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (data) {
      if (data.status === "ok") {
        setPage(data);
        getFriends(data.friends);
      } else if (data.status === "error") window.location.href = data.href;
    },
  });
}

function reqConvoWith(id) {
  for (let i = 0; i < convos.length; i++) {
    const con = convos[i];
    if (con.friend.id === id) {
      openConvo(i);
      return;
    }
  }

  startConvo(convos.length, id);
}
