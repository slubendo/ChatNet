const socket = io();

document.getElementById("chat-form").addEventListener("submit", function (e) {
  e.preventDefault(); // prevents page reloading
  const message = document.getElementById("m").value.toString(); // Convert the value to string
  socket.emit("chat message", message);
  document.getElementById("m").value = "";
});

socket.on("chat message", function (data) {
  const li = document.createElement("li");
  li.textContent = data;
  document.getElementById("messages").appendChild(li);
});

document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault(); // prevents page reloading
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  socket.emit("login", { username, password });
});

// Listen for bot mentions and pass the user's prompt to the OpenAI API
socket.on("bot mention", function (data) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/openai");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = function () {
    if (xhr.status === 200) {
      socket.emit("chat message", JSON.parse(xhr.responseText).message);
    }
  };
  xhr.send(JSON.stringify({ prompt: data.msg }));
});
