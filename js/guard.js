function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch (e) {
    return true;
  }
}

(function guardPages() {
  const token = localStorage.getItem("token");
  const currentPage = window.location.pathname.split("/").pop();

  const isLoginPage = currentPage === "login.html" || currentPage === "";

  // Case 1: No token or expired token
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("token");

    if (!isLoginPage) {
      // FIXED: Redirect the top window, not iframe
      if (window.top !== window.self) {
        // We're in an iframe
        window.top.location.replace("login.html");
      } else {
        // We're not in an iframe
        window.location.replace("login.html");
      }
    }
    return;
  }

  // Case 2: Token exists → prevent going back to login
  if (isLoginPage) {
    window.location.replace("index.html");
  }
})();