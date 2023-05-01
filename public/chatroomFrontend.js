const socket = io();

document.getElementById("chat-form").addEventListener("submit", function (e) {
  e.preventDefault(); // prevents page reloading
  const message = document.getElementById("m").value.toString(); // Convert the value to strings
  socket.emit("chat message", message);
  document.getElementById("m").value = "";
});

document.querySelector(".sendIcon").addEventListener("click", function (e) {
  e.preventDefault(); // prevents page reloading
  const message = document.getElementById("m").value.toString(); // Convert the value to strings
  socket.emit("chat message", message);
  document.getElementById("m").value = "";
});

// Listen for the "chats" event and update the UI
socket.on("chats", function (chats) {
  let userName = session();
  const messagesList = document.getElementById("messages");
  messagesList.innerHTML = "";
  for (let i = 0; i < chats.length; i++) {
    const li = document.createElement("li");
    const span = document.createElement("span"); // Create a <span> element to hold the username
    if (chats[i].username == userName) {
      li.classList.add("you");
    } else if (chats[i].username == "ChatGPT") {
      li.classList.add("chatGPT");
    }

    span.textContent = chats[i].username + ": "; // Set the text content of the <span> element to the username
    li.appendChild(span); // Append the <span> element to the <li> element
    li.textContent += chats[i].message; // Append the message to the <li> element
    messagesList.appendChild(li);
  }
});

socket.on("chat message", function (data) {
  let userName = session();
  const li = document.createElement("li");
  if (data.username == userName) {
    li.classList.add("you");
  } else if (data.username == "ChatGPT") {
    li.classList.add("chatGPT");
  }
  const span = document.createElement("span"); // Create a <span> element to hold the username
  span.textContent = data.username + ": "; // Set the text content of the <span> element to the username
  li.appendChild(span); // Append the <span> element to the <li> element
  li.textContent += data.message; // Append the message to the <li> element
  document.getElementById("messages").appendChild(li);
});

function session() {
  let user = "";
  fetch(`/session`, {
    method: "GET",
    body: JSON.stringify(),
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((body) => {
      user = body.session;
    })
    .catch(console.log);
  return user;
}

// Listen for the "rooms" event and update the UI
socket.on("rooms", function (rooms) {
  const roomsList = document.getElementById("rooms");
  roomsList.innerHTML = "";
  for (let i = 0; i < rooms.length; i++) {
    const a = document.createElement("a");
    a.textContent = rooms[i];
    a.href = "/chat/" + rooms[i];
    const li = document.createElement("li");
    li.appendChild(a);
    roomsList.appendChild(li);
  }
});

