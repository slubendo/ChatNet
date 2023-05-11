// may not need it anymore
const newChatBtn = document.getElementById("new-chat-btn");
newChatBtn.addEventListener("click", (event) => {
  event.preventDefault();
});

const createChatForm = document.getElementById("create-chat-form");
const chatNameInput = document.getElementById("chat-name-input");
const errorElement = document.getElementById("error-message");

createChatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const chatName = chatNameInput.value.trim();
  if (chatName === "") {
    errorElement.textContent = "Please enter a valid chat name.";
    chatNameInput.value = "";
    return;
  }
  createChatForm.submit();
});

document
  .getElementById("close-modal-btn")
  .addEventListener("click", (event) => {
    errorElement.textContent = "";
  });

//window.location.href = "/home";
