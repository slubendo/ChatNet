const socket = io();

document.getElementById("chat-form").addEventListener("submit", function (e) {
  e.preventDefault(); // prevents page reloading
  const message = document.getElementById("m").value.toString(); // Convert the value to string
  socket.emit("chat message", message);
  document.getElementById("m").value = "";
});

document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault(); // prevents page reloading
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  socket.emit("login", { username, password });
});

socket.on("bot mention", function (data) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/openai");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = function () {
    if (xhr.status === 200) {
      const botResponse = JSON.parse(xhr.responseText).message;
      socket.emit("chat message", { username: "@bot", message: botResponse });
    }
  };
  xhr.send(JSON.stringify({ prompt: data.msg }));
});

// Listen for the "chats" event and update the UI
socket.on("chats", function (chats) {
  const messagesList = document.getElementById("messages");
  for (let i = 0; i < chats.length; i++) {
    const li = document.createElement("li");
    const span = document.createElement("span"); // Create a <span> element to hold the username
    span.textContent = chats[i].username + ": "; // Set the text content of the <span> element to the username
    li.appendChild(span); // Append the <span> element to the <li> element
    li.textContent += chats[i].message; // Append the message to the <li> element
    messagesList.appendChild(li);
  }
});

socket.on("chat message", function (data) {
  const li = document.createElement("li");
  const span = document.createElement("span"); // Create a <span> element to hold the username
  span.textContent = data.username + ": "; // Set the text content of the <span> element to the username
  li.appendChild(span); // Append the <span> element to the <li> element
  li.textContent += data.message; // Append the message to the <li> element
  document.getElementById("messages").appendChild(li);
});
