let notifications = [];

function updateNotifications(notification) {
  console.log("Updating notifications with:", notification);

  notifications.unshift(notification);

  // Update notification count
  const notificationCount = document.querySelector(".notification-count");
  if (notificationCount) {
    notificationCount.textContent = notifications.length;
  }

  // Update dropdown content
  const dropdownContent = document.getElementById("notifications-dropdown");
  if (dropdownContent) {
    dropdownContent.innerHTML = notifications
      .map(
        (notif) => `
                    <li>
                        <a href="#!" class="notification-item">
                            <span class="notification-message">${
                              notif.message
                            }</span>
                            <span class="notification-time">${new Date(
                              notif.timestamp
                            ).toLocaleTimeString()}</span>
                        </a>
                    </li>
                `
      )
      .join("");
  }

  // Show toast notification
  if (M && M.toast) {
    M.toast({ html: notification.message });
  }
}

// Connect to main notification socket
const socket = io();
socket.on("connect", () => {
  console.log("Connected to socket server");
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

socket.on("notification", (data) => {
  console.log("Received notification:", data);
  updateNotifications(data);
});
