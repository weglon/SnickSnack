async function login() {
  const username = $("#username").val();
  const password = $("#password").val();

  if (username === "" || password === "") {
    $("#error").html("* You need to fill out both fields");
    return;
  }

  $.ajax({
    url: "/api/login",
    type: "POST",
    data: JSON.stringify({ username, password }),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (data) {
      if (data.status === "ok") {
        localStorage.setItem("token", data.token);
        window.location.href = data.href;
      } else if (data.status === "error") $("#error").html(data.msg);
    },
  });
}
