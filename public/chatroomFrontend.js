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

// socket.on("bot mention", function (data) {
//   const xhr = new XMLHttpRequest();
//   xhr.open("POST", "/api/openai");
//   xhr.setRequestHeader("Content-Type", "application/json");
//   xhr.onload = function () {
//     if (xhr.status === 200) {
//       const botResponse = JSON.parse(xhr.responseText).message;
//       socket.emit("chat message", { username: "@bot", message: botResponse });
//     }
//   };
//   xhr.send(JSON.stringify({ prompt: data.msg }));
// });

// Listen for the "chats" event and update the UI
socket.on("chats", function (chats, users) {
  let userName = session();
  console.log(userName)
  console.log(users)
  const messagesList = document.getElementById("messages");
  for (let i = 0; i < chats.length; i++) {
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
});

socket.on("chat message", function (data) {
  let userName = session();
  const li = document.createElement("li");

  if(data.username == userName) {
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


let user;
function session() {
  let session = fetch(`/session`, { method: "GET", body: JSON.stringify(), headers: { "Content-Type": "application/json" } })
  .then(response => response.json())
  .then(body => {
     user = body.user
    console.log(user)
    // return user
  })
  .catch(console.log)
  return user
}

// async function  models()  {
//   let models = {};
//   let users;
//   let session = fetch(`/model`, { method: "GET", headers: { "Content-Type": "application/json" } })
//   .then(response => response.json())
//   .then(body => {
//     let chats = body.chat
//     users = body.user
//     let messages = body.message
    
//     console.log(body)
//      models = {
//       // chatModel: chats,
//       userModel: users ,
//       // messageModel: messages,
//     }
//   })
//   .catch(console.log)
//   return users
// }
