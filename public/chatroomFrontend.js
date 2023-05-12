const currentURL = window.location.href;
const urlParts = currentURL.split('/');
const chatRoomId = urlParts[urlParts.length - 1];

async function getCurrentUser() {
  const response = await fetch(`/currentUser`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const body = await response.json();
  const currentUser = body.currentUser;

  return currentUser;
}

(async () => {
  // const chatRoomId = 45;
  const currentUserData = await getCurrentUser();

  console.log(chatRoomId);
  console.log(currentUserData);

  const socket = io({
    query: { chatRoomId, currentUserData: JSON.stringify(currentUserData), },
  });

// Message bar functionality
document.getElementById("chat-form").addEventListener("keydown", function (e) {
  if (e.code === "Enter" && e.shiftKey) {
  } else if (e.code === "Enter") {
    const message = document.getElementById("m").value.toString(); // Convert the value to strings
    socket.emit("chat message", message);
    document.getElementById("m").value = "";
  }
});

document.querySelector(".sendIcon").addEventListener("click", function (e) {
  e.preventDefault(); // prevents page reloading
  const message = document.getElementById("m").value.toString(); // Convert the value to strings
  socket.emit("chat message", message);
  document.getElementById("m").value = "";
});

// Chat messages with socket io
socket.on("chats", async function (messages) {
  let currentUser = await session();
  const messagesList = document.getElementById("messages");
  for (let i = 0; i < messages.length; i++) {
    const outerDiv = document.createElement("div");
    const messageDiv = document.createElement("div"); // Create a <span> element to hold the username
    outerDiv.classList.add("outer", "flex", "justify-start", "mb-4");
    messageDiv.classList.add(
      "message",
      "mr-2",
      "py-3",
      "px-4",
      "bg-gray-400",
      "rounded-br-3xl",
      "rounded-tr-3xl",
      "rounded-tl-xl",
      "text-white"
    );
    let senderUsername = messages[i].sender.username;
    if (senderUsername == currentUser) {
      outerDiv.classList.remove("justify-start");
      outerDiv.classList.add("you", "justify-end");
      messageDiv.classList.remove(
        "bg-gray-400",
        "rounded-br-3xl",
        "rounded-tr-3xl",
        "rounded-tl-xl"
      );
      messageDiv.classList.add(
        "bg-blue-400",
        "rounded-bl-3xl",
        "rounded-tl-3xl",
        "rounded-tr-xl"
      );
    } else if (senderUsername == "ChatGPT") {
      messageDiv.classList.remove("bg-gray-400");
      messageDiv.classList.add("chatGPT", "bg-green-500");
    }

    messageDiv.innerHTML = senderUsername + ": "; // Set the text content of the <span> element to the username
    outerDiv.prepend(messageDiv); // Append the <span> element to the <li> element
    messageDiv.innerHTML += messages[i].text; // Append the message to the <li> element
    messagesList.prepend(outerDiv);
  }
});

// FIX THIS !!!
socket.on("chat message", async function (data) {
  console.log("currentUserData.username: "+currentUserData.username);
  console.log(currentUserData)
  let userName = await session();
  console.log("userName: "+userName)
  console.log(data)
  const outerDiv = document.createElement("div");
  const messageDiv = document.createElement("div"); // Create a <span> element to hold the username
  outerDiv.classList.add("outer", "flex", "justify-start", "mb-4");
  messageDiv.classList.add(
    "message",
    "mr-2",
    "py-3",
    "px-4",
    "bg-gray-400",
    "rounded-br-3xl",
    "rounded-tr-3xl",
    "rounded-tl-xl",
    "text-white"
  );

  if (currentUserData.username == data.username) {
    console.log("currentUserData.username == userName")
    outerDiv.classList.remove("justify-start");
    outerDiv.classList.add("you", "justify-end");
    messageDiv.classList.remove(
      "bg-gray-400",
      "rounded-br-3xl",
      "rounded-tr-3xl",
      "rounded-tl-xl"
    );
    messageDiv.classList.add(
      "bg-blue-400",
      "rounded-bl-3xl",
      "rounded-tl-3xl",
      "rounded-tr-xl"
    );
  } else if (data.username == "ChatGPT") {
    console.log("data.username == ChatGPT")

    messageDiv.classList.remove("bg-gray-400");
    messageDiv.classList.add("chatGPT", "bg-green-500");
  }

  messageDiv.innerHTML = data.username + ": "; // Set the text content of the <span> element to the username
  outerDiv.prepend(messageDiv); // Append the <span> element to the <li> element
  messageDiv.innerHTML += data.message; // Append the message to the <li> element
  document.getElementById("messages").prepend(outerDiv);
});

// Session
async function session() {
  const response = await fetch(`/session`, {
    method: "GET",
    body: JSON.stringify(),
    headers: { "Content-Type": "application/json" },
  });
  const body = await response.json();
  const username = body.session;

  return username;
}

const scrollingElement = document.getElementById("messages");

const config = { childList: true };

const callback = function (mutationsList, observer) {
  for (let mutation of mutationsList) {
    if (mutation.type === "childList") {
      window.scrollTo(0, document.body.scrollHeight);
    }
  }
};

const observer = new MutationObserver(callback);
observer.observe(scrollingElement, config);

//@ search user in database
const addMemberMessage = document.getElementById("addMemberMessage");
const emailInput = document.getElementById("simple-search");
const addChatMemberBtn = document.getElementById("add-to-chat");
const backToChatBtn = document.getElementById("back-to-chat");

document
  .getElementById("submitSearchInput")
  .addEventListener("click", searchByEmail);

async function searchByEmail(event) {
  event.preventDefault();
  const emailInputValue = emailInput.value;

  try {
    const response = await fetch("/search-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emailInputValue }),
    });

    const result = await response.json();

    if (result.success) {
      // Display the result to the user
      const { username, email } = result.resultedUser;
      document.getElementById("result-container").innerHTML = `<h4
        class="text-lg font-light text-gray-900 dark:text-white mb-1">
        Search results: </h4>
        <div
        class="py-2 px-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 flex justify-between">
        <div class="justify-center">
        <p class="text-base text-gray-900">
        ${username}
        </p>
        <p class="font-light text-base">
        ${email}
        </p>
        </div>
        <div class="justify-center pt-2">
        <input id="default-checkbox" type="checkbox" value="${email}"
        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
        
        </div>
        </div>`;
    } else {
      addMemberMessage.textContent = `No user found with email ${emailInputValue}`;
    }
  } catch (error) {
    console.error("Error searching user:", error);
  }
}

//@ add member to chat

document.getElementById("add-to-chat").addEventListener("click", addMember);
const resultContainer = document.getElementById("result-container");
async function addMember(event) {
  event.preventDefault();
  const checkbox = document.getElementById("default-checkbox");

  if (checkbox.checked) {
    const email = checkbox.value;
    console.log(email);
    try {
      const response = await fetch("/add-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        addMemberMessage.textContent = `${result.message}`;
        addMemberMessage.classList.add("text-blue-500");
        addMemberMessage.classList.remove("text-red-600");
        backToChatBtn.classList.remove("noDisplay");
        addChatMemberBtn.classList.add("noDisplay");
      } else {
        console.log("error: ", result.error);
        addMemberMessage.textContent = `${result.error}`;
      }
    } catch (error) {
      addMemberMessage.textContent = `${error}`;
    }
  } else {
    addMemberMessage.textContent = `Please confirm the user by checking the box.`;
  }
}

document
  .getElementById("close-addmember-modal")
  .addEventListener("click", () => {
    addMemberMessage.textContent = "";
    resultContainer.innerHTML = "";
    emailInput.value = "";
  });

backToChatBtn.addEventListener("click", () => {
  const roomId = backToChatBtn.getAttribute("data-room-id");
  const chatroomPath = "/chatroom/" + roomId;
  window.location.href = chatroomPath;
});

})();