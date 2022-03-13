let termsAccepted = false;

function acceptTerms() {
  if (!termsAccepted) {
    termsAccepted = true;
    document.querySelector("#acceptCheck").style = "opacity:1 !important";
  } else {
    termsAccepted = false;
    document.querySelector("#acceptCheck").style = "opacity:0.5 !important";
  }
}

function register() {
  const username = $("#username").val();
  const password = $("#password").val();
  const email = $("#email").val().toLowerCase();
  const conpass = $("#confirmpass").val();

  if (username === "" || password === "" || email === "" || conpass === "") {
    $("#error").html("You need to fill out all fields");
    return;
  }

  if (conpass != password) {
    $("#error").html("Passwords did not match");
    return;
  }

  if (!validateEmail(email)) {
    $("#error").html("Incorrect email");
    return;
  }

  // Sending JSON with ajax
  if (termsAccepted) {
    $.ajax({
      url: "/api/register",
      type: "POST",
      data: JSON.stringify({ username, email, password }),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function (data) {
        if (data.status === "ok") {
          window.location.href = data.href;
        } else if (data.status === "error") $("#error").html(data.msg);
      },
    });
  } else {
    $("#error").html("You need to accept the terms below to register");
  }
}
