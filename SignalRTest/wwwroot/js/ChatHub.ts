"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();
var sendButton = document.getElementById("sendButton") as HTMLButtonElement;
var userInput = document.getElementById("userInput") as HTMLInputElement;
var messageInput = document.getElementById("messageInput") as HTMLInputElement;

//Disable send button until connection is established
sendButton.disabled = true;

connection.on("ReceiveMessage", function (user: string, message: string) {
    var msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var encodedMsg = `${user}: ${msg}`;
    var messageDiv = document.createElement("div");
    messageDiv.className = "w-100";
    messageDiv.textContent = encodedMsg;
    document.getElementById("messagesList").appendChild(messageDiv);

    if (user != userInput.value) {
        notifyMe(messageDiv.innerText);
    }
});

connection
    .start()
    .then(function () {
        sendButton.disabled = false;
    })
    .catch(function (err) {
        return console.error(err.toString());
    });

document
    .getElementById("sendButton")
    .addEventListener("click", function (event) {
        var user = userInput.value;
        var message = messageInput.value;
        connection
            .invoke("SendMessage", user, message)
            .catch(function (err) {
                return console.error(err.toString());
            });
        event.preventDefault();
    });

// https://developer.mozilla.org/en-US/docs/Web/API/notification
function notifyMe(message: string) {
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
    }
    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        var notification = new Notification(message);
    }
    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
            // If the user accepts, let's create a notification
            if (permission === "granted") {
                var notification = new Notification(message);
            }
        });
    }
}
