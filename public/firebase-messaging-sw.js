/* public/firebase-messaging-sw.js */

importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBuj66F305yZf5dZwrYV1EioCiy_MPN6zI",
  authDomain: "couplenest-50da4.firebaseapp.com",
  projectId: "couplenest-50da4",
  storageBucket: "couplenest-50da4.firebasestorage.app",
  messagingSenderId: "380521251943",
  appId: "1:380521251943:web:f7aae9286d4417050b80c2",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Background message:",
    payload
  );

  const notificationTitle =
    payload.notification?.title ||
    payload.data?.title ||
    "CoupleNest ❤️";

  const notificationBody =
    payload.notification?.body ||
    payload.data?.body ||
    "You have a new message.";

  const notificationUrl =
    payload.data?.url || "/chat";

  self.registration.showNotification(notificationTitle, {
    body: notificationBody,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: {
      url: notificationUrl,
    },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification?.data?.url || "/chat";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }

      return undefined;
    })
  );
});