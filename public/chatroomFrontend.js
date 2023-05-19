// import MarkdownIt from "markdown-it";
// import hljs from "highlight.js";

// const md = new MarkdownIt({
//   highlight: function (str, lang) {
//     return (
//       '<pre class="hljs"><code>' +
//       hljs.highlightAuto(str).value +
//       "</code></pre>"
//     );
//   },
//   html: true,
// });

const currentURL = window.location.href;
const urlParts = currentURL.split("/");
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
  const currentUserData = await getCurrentUser();

  const socket = io({
    query: { chatRoomId, currentUserData: JSON.stringify(currentUserData) },
  });

  // Message bar functionality
  document
    .getElementById("chat-form")
    .addEventListener("keydown", function (e) {
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

      messageDiv.innerHTML = senderUsername + ": ";

      let senderUsername = messages[i].username;
      if (senderUsername == currentUserData.username) {
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
        messageDiv.innerHTML += messages[i].text;
      } else if (senderUsername == "ChatGPT") {
        messageDiv.classList.remove("bg-gray-400");
        messageDiv.classList.add("chatGPT", "bg-green-500");
        messageDiv.innerHTML += messages[i].text;
      } else if (senderUsername == "System") {
        messageDiv.classList.remove("bg-gray-400");
        messageDiv.classList.add("System", "bg-yellow-500");
        messageDiv.innerHTML += messages[i].text;
      }

      outerDiv.prepend(messageDiv);
      messagesList.prepend(outerDiv);
    }
  });

  // FIX THIS !!!
  socket.on("chat message", async function (data) {
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

    messageDiv.innerHTML = data.username + ": ";
    messageDiv.innerHTML += `<p>${data.message}</p>`;

    if (currentUserData.username == data.username) {
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
      console.log("data.username == ChatGPT");

      messageDiv.classList.remove("bg-gray-400");
      messageDiv.classList.add("chatGPT", "bg-green-500");
    } else if (data.username == "System") {
      console.log("data.username == System");

      messageDiv.classList.remove("bg-gray-400");
      messageDiv.classList.add("System", "bg-yellow-500");

      const codeSnippetMsgForSystem = document.createElement("p");
      codeSnippetMsgForSystem.innerHTML =
        "To send a code snippet in your message, try <p>```js (or python)</p><p>  // your code</p><p>```</p>";

      messageDiv.appendChild(codeSnippetMsgForSystem);
    }

    outerDiv.prepend(messageDiv);

    if (chatRoomId == data.chatRoomId) {
      document.getElementById("messages").prepend(outerDiv);
    }
  });

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
  const addMemberBackToChatBtn = document.getElementById(
    "addMember-back-to-chat"
  );

  document
    .getElementById("submitSearchInput")
    .addEventListener("click", searchByEmail);

  async function searchByEmail(event) {
    event.preventDefault();
    addMemberMessage.textContent = "";
    addChatMemberBtn.classList.remove("noDisplay");
    addMemberBackToChatBtn.classList.add("noDisplay");
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
      try {
        const response = await fetch("/add-member", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, chatRoomId }),
        });

        const result = await response.json();

        if (result.success) {
          addMemberMessage.textContent = `${result.message}`;
          addMemberMessage.classList.add("text-blue-500");
          addMemberMessage.classList.remove("text-red-600");
          addMemberBackToChatBtn.classList.remove("noDisplay");
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

  //@ helper function: go back to chatroom

  const backToChatroom = (triggeredBtn) => {
    const roomId = triggeredBtn.getAttribute("data-room-id");
    const chatroomPath = "/chatroom/" + roomId;
    window.location.href = chatroomPath;
  };

  document
    .getElementById("close-addmember-modal")
    .addEventListener("click", () => {
      addMemberMessage.textContent = "";
      resultContainer.innerHTML = "";
      emailInput.value = "";
      backToChatroom(document.getElementById("close-addmember-modal"));
    });

  addMemberBackToChatBtn.addEventListener("click", () => {
    backToChatroom(addMemberBackToChatBtn);
  });

  //@ helper function to remove member
  const removeModalResultContainer = document.getElementById(
    "remove-result-container"
  );
  const removeMemberModalMessage = document.getElementById(
    "removeMemberMessage"
  );
  const removeMemberModalForm = document.querySelector(".remove-member-form");
  const removeModalBackToChatBtn = document.getElementById(
    "remove-back-to-chat"
  );

  const removeMember = async (event, email) => {
    event.preventDefault();
    try {
      const response = await fetch("/remove-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, chatRoomId }),
      });

      const result = await response.json();

      if (result.success) {
        removeMemberModalForm.classList.add("noDisplay");
        removeModalResultContainer.classList.remove("noDisplay");
        removeMemberModalMessage.textContent = `${result.message}`;
      } else {
        console.log("error: ", result.error);
        removeMemberModalMessage.classList.add("text-red-600");
        removeMemberModalMessage.classList.remove("text-blue-600");
        removeMemberModalMessage.textContent = `${result.error}, please try again.`;
      }
    } catch (error) {
      removeMemberModalMessage.classList.add("text-red-600");
      removeMemberModalMessage.classList.remove("text-blue-600");
      removeMemberModalMessage.textContent = `${error}`;
    }
  };

  //@ highlight member in chat
  document.querySelectorAll(".member-card").forEach((card) => {
    card.addEventListener("click", (event) => {
      event.stopPropagation();
      document.querySelectorAll(".member-card").forEach((card) => {
        card.classList.remove("active", "border-green-500");
      });
      card.classList.add("active", "border-green-500");
      document.querySelectorAll(".remove-button").forEach((button) => {
        button.classList.add("hidden");
      });
      card.querySelector(".remove-button").classList.remove("hidden");

      //@ Show remove member modal
      const memberEmail = card.getAttribute("data-memberEmail");
      const memberUsername = card.getAttribute("data-memberUsername");

      const removeMemberModal = document.querySelector("#removeMember-modal");

      removeMemberModal.querySelector(
        "#remove-warning-title"
      ).innerHTML = `Remove <strong>${memberUsername} (${memberEmail})</strong>`;
      removeMemberModal.querySelector(
        "#remove-warning-detail"
      ).innerHTML = `Are you sure you want to remove <strong>${memberUsername} (${memberEmail})</strong> from this chat?`;

      let confirmRemoveBtn = removeMemberModal.querySelector("#confirm-remove");
      const newConfirmRemoveBtn = confirmRemoveBtn.cloneNode(true);
      confirmRemoveBtn.parentNode.replaceChild(
        newConfirmRemoveBtn,
        confirmRemoveBtn
      );
      confirmRemoveBtn = newConfirmRemoveBtn;
      confirmRemoveBtn.addEventListener("click", (event) => {
        removeMember(event, memberEmail);
      });
    });
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".member-card").forEach((card) => {
      card.classList.remove("active", "border-green-500");
    });
    document.querySelectorAll(".remove-button").forEach((button) => {
      button.classList.add("hidden");
    });
  });

  removeModalBackToChatBtn.addEventListener("click", () => {
    const roomId = removeModalBackToChatBtn.getAttribute("data-room-id");
    const chatroomPath = "/chatroom/" + roomId;
    window.location.href = chatroomPath;
  });

  document
    .getElementById("close-removeMember-modal")
    .addEventListener("click", () => {
      backToChatroom(document.getElementById("close-removeMember-modal"));
    });

  //@ leave chat helper function
  const leaveChat = async (event) => {
    event.preventDefault();
    let email = currentUserData.email;
    try {
      const response = await fetch("/leave-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, chatRoomId }),
      });

      const result = await response.json();

      if (result.success) {
        window.location.href = result.redirectUrl;
      } else {
        console.log("error: ", result.error);
      }
    } catch (error) {
      console.log("leave chat error: ", error);
    }
  };

  const confirmLeaveChatBtn = document.getElementById("confirm-leave");
  confirmLeaveChatBtn.addEventListener("click", (e) => {
    leaveChat(e);
  });

  document
    .getElementById("close-clearChat-modal")
    .addEventListener("click", () => {
      backToChatroom(document.getElementById("close-clearChat-modal"));
    });

  //@ clear chat helper function

  const clearChat = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("/clear-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatRoomId }),
      });

      const result = await response.json();

      if (result.success) {
        window.location.href = result.redirectUrl;
      } else {
        console.log("error: ", result.error);
      }
    } catch (error) {
      console.log("leave chat error: ", error);
    }
  };

  const confirmClearChatBtn = document.getElementById("confirm-clear");
  confirmClearChatBtn.addEventListener("click", (e) => {
    clearChat(e);
  });

  document
    .getElementById("close-leaveChat-modal")
    .addEventListener("click", () => {
      backToChatroom(document.getElementById("close-leaveChat-modal"));
    });
})();
