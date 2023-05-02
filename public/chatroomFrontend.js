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
socket.on("chats", async function (chats, users, chatRoomId) {
  let userName = await session()
  console.log(userName)
  console.log(users)
  const messagesList = document.getElementById("messages");
  for (let i = 0; i < chats.length; i++) {
    if(chats[i].chatId == chatRoomId) {
      const li = document.createElement("li");
      const span = document.createElement("span"); // Create a <span> element to hold the username
  
      if(users[i] == userName) {
        li.classList.add("you");
      } else if (users[i] == "ChatGPT") {
        li.classList.add("chatGPT");
      }
  
      span.textContent = users[i] + ": "; // Set the text content of the <span> element to the username
      li.appendChild(span); // Append the <span> element to the <li> element
      li.textContent += chats[i].text; // Append the message to the <li> element
      messagesList.appendChild(li);

    }
  }
});

socket.on("chat message", async function (data) {
  let userName = await session();
  const li = document.createElement("li");

  if(data.username == userName) {
    li.classList.add("you");
  } else if (data.username == "ChatGPT") {
    li.classList.add("chatGPT");
  }
  const span = document.createElement("span") // Create a <span> element to hold the username
  span.textContent = data.username + ": "; // Set the text content of the <span> element to the username
  li.appendChild(span); // Append the <span> element to the <li> element
  li.textContent += data.message; // Append the message to the <li> element
  document.getElementById("messages").appendChild(li);
});


async function session() {
  const response = await fetch(`/session`, { method: "GET", body: JSON.stringify(), headers: { "Content-Type": "application/json" } })
  const body = await response.json()

  const user = body.session;
    console.log(user)

  return user
}