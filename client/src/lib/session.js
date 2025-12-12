// client/src/lib/session.js
// ----------------------------------------------------
// Creates / retrieves a persistent guest session ID
// ----------------------------------------------------

export function getSessionId() {
  let id = localStorage.getItem("sessionId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("sessionId", id);
  }
  return id;
}
