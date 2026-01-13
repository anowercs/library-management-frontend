const API_BASE = "http://localhost:8080/api";
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

