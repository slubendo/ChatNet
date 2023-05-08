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
socket.on("chats", async function (messages) {
  let currentUser = await session();
  const messagesList = document.getElementById("messages");
  for (let i = 0; i < messages.length; i++) {
    const outerDiv = document.createElement("div");
    const messageDiv = document.createElement("div"); // Create a <span> element to hold the username
    outerDiv.classList.add("outer", "flex", "justify-start", "mb-4");
    messageDiv.classList.add("message", "mr-2", "py-3", "px-4", "bg-gray-400", "rounded-br-3xl", "rounded-tr-3xl", "rounded-tl-xl", "text-white");
    let senderUsername = messages[i].sender.username
    if (senderUsername == currentUser) {
      outerDiv.classList.remove("justify-start");
      outerDiv.classList.add("you", "justify-end");
      messageDiv.classList.remove("bg-gray-400", "rounded-br-3xl", "rounded-tr-3xl", "rounded-tl-xl");
      messageDiv.classList.add("bg-blue-400", "rounded-bl-3xl", "rounded-tl-3xl", "rounded-tr-xl");
    } else if (senderUsername == "ChatGPT") {
      messageDiv.classList.remove("bg-gray-400");
      messageDiv.classList.add("chatGPT", "bg-green-500");
    }

    messageDiv.textContent = senderUsername + ": "; // Set the text content of the <span> element to the username
    outerDiv.appendChild(messageDiv); // Append the <span> element to the <li> element
    messageDiv.textContent += messages[i].text; // Append the message to the <li> element
    messagesList.appendChild(outerDiv);
  }
});

socket.on("chat message", async function (data) {
  let userName = await session();
  const outerDiv = document.createElement("div");
  const messageDiv = document.createElement("div"); // Create a <span> element to hold the username
  outerDiv.classList.add("outer", "flex", "justify-start", "mb-4");
  messageDiv.classList.add("message", "mr-2", "py-3", "px-4", "bg-gray-400", "rounded-br-3xl", "rounded-tr-3xl", "rounded-tl-xl", "text-white");

  if (data.username == userName) {
    outerDiv.classList.remove("justify-start");
    outerDiv.classList.add("you", "justify-end");
    messageDiv.classList.remove("bg-gray-400", "rounded-br-3xl", "rounded-tr-3xl", "rounded-tl-xl");
    messageDiv.classList.add("bg-blue-400", "rounded-bl-3xl", "rounded-tl-3xl", "rounded-tr-xl");
  } else if (data.username == "ChatGPT") {
    messageDiv.classList.remove("bg-gray-400");
    messageDiv.classList.add("chatGPT", "bg-green-500");;
  }
  messageDiv.textContent = data.username + ": "; // Set the text content of the <span> element to the username
  outerDiv.appendChild(messageDiv); // Append the <span> element to the <li> element
  messageDiv.textContent += data.message; // Append the message to the <li> element
  document.getElementById("messages").appendChild(outerDiv);
});

async function session() {
  const response = await fetch(`/session`, {
    method: "GET",
    body: JSON.stringify(),
    headers: { "Content-Type": "application/json" },
  });
  const body = await response.json();
  const username = body.session;
  console.log(username);

  return username;
}
