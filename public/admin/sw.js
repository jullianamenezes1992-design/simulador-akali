/* Service worker do app Akali CRM (escopo /admin/). Só cuida de notificações; não guarda páginas em cache
   para nunca mostrar dados desatualizados de clientes. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let d = {};
  try {
    d = event.data ? event.data.json() : {};
  } catch {
    d = { title: "Akali CRM", body: event.data ? event.data.text() : "" };
  }
  const title = d.title || "Akali CRM";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: d.body || "",
      icon: "/app/icon-192.png",
      badge: "/app/icon-192.png",
      tag: d.tag || undefined,
      data: { url: d.url || "/admin/agenda" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL((event.notification.data && event.notification.data.url) || "/admin/agenda", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.startsWith(self.location.origin + "/admin") && "focus" in c) {
          c.navigate(url);
          return c.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
