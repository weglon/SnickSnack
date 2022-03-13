const colors = [
  "#e0b535",
  "#cc6a24",
  "#FF6363",
  "#8e2c64",
  "#882c8e",
  "#9A8194",
  "#6965a5",
  "#5c9da5",
  "#99BBAD",
  "#2c8e65",
  "#65a56d",
  "#73a565",
];

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
let profEditOpened = false;
let selectedColor = "";
let selectedImage = "";

function saveSettings() {
  let bio = $("#description_input").val();
  const token = localStorage.getItem("token");

  if (!token) return;
  if (!selectedImage && !selectedColor && !bio) return;

  if (!selectedImage) selectedImage = client.profile.image;
  if (!selectedColor) selectedColor = client.profile.color;
  if (!bio) bio = client.profile.desc;

  $.ajax({
    url: "/api/editprofile",
    type: "POST",
    data: JSON.stringify({
      token,
      image: selectedImage,
      color: selectedColor,
      desc: bio,
    }),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (data) {
      console.log(data.status);
      window.location.href = data.href;
    },
  });
}

function settingsMenu() {
  if (!profEditOpened) {
    $(".settings_menu").css("left", "calc(100% - 380px)");
    profEditOpened = true;
  } else {
    $(".settings_menu").css("left", "100%");
    profEditOpened = false;
  }
}

function selectImage(image, index) {
  selectedImage = image;
  let par = $(".image_option_div").children();
  for (let i = 0; i < par.length; i++) {
    let img = par[i];
    if (i === index) {
      img.style = "opacity: 0.3";
    } else {
      img.style = "opacity: 1";
    }
  }
}

function selectColor(color, index) {
  selectedColor = color;
  let par = $(".color_option_div").children();
  for (let i = 0; i < par.length; i++) {
    let c = par[i];
    let currCol = c.style.backgroundColor;
    if (i === index) c.style = `opacity: 0.3; background-color: ${currCol}`;
    else c.style = `opacity: 1; background-color: ${currCol}`;
  }
}

function createEditorWindow(par) {
  let imagesDiv = $(".image_option_div");
  let colorsDiv = $(".color_option_div");

  for (let j in images) {
    let i = images[j];
    imagesDiv.append(
      `<div class='image_options' onclick='selectImage("${i}", ${j})'><i class="${i}"></div>`
    );
  }

  for (let j in colors) {
    let c = colors[j];
    colorsDiv.append(
      `<div class='color_options' style='opacity: 1; background-color: ${c}' onclick='selectColor("${c}", ${j})'></div>`
    );
  }
}
