function changepass() {
  const password = $("#password").val();
  const conpass = $("#confirmpass").val();
  const token = localStorage.getItem("token");

  if (conpass != password) {
    $("#error").html("Passwords did not match");
    return;
  }

  if (!token) {
    $("#error").html("You cant change your password without being logged in");
    return;
  }

  // Sending JSON with ajax
  $.ajax({
    url: "/api/changepass",
    type: "POST",
    data: JSON.stringify({ token, password }),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (data) {
      if (data.status === "ok") {
        window.location.href = data.href;
      } else if (data.status === "error") $("#error").html(data.msg);
    },
  });
}
