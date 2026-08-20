export function isNotificationSupported() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window
  );
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    return "unsupported";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  return await Notification.requestPermission();
}

export function showPlannerNotification(
  title: string,
  options?: NotificationOptions
) {
  if (!isNotificationSupported()) {
    return false;
  }

  if (Notification.permission !== "granted") {
    return false;
  }

  new Notification(title, {
    icon: "/favicon.ico",
    ...options,
  });

  return true;
}
