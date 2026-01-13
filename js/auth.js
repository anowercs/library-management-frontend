
const API_BASE = "http://localhost:8080/api";

/*

// LOGIN
function login(event) {
    event.preventDefault();

    const userName = document.getElementById("userName").value;
    const password = document.getElementById("password").value;

    fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ userName, password })
    })
    .then(res => {
        if (!res.ok) throw new Error("Login failed");
        return res.json();
    })
    .then(data => {
        localStorage.setItem("token", data.token);
        window.location.href = "index.html";
    })
    .catch(err => {
        document.getElementById("msg").innerText = "Invalid username or password";
    });
}

*/


// LOGIN
function login(event) {
    event.preventDefault();
    
    // UI enhancements
    const btn = document.getElementById('loginBtn');
    const msgEl = document.getElementById('msg');
    btn.classList.add('loading');
    btn.textContent = '';
    msgEl.classList.remove('show');

    const userName = document.getElementById("userName").value;
    const password = document.getElementById("password").value;

    fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ userName, password })
    })
    .then(res => {
        if (!res.ok) throw new Error("Login failed");
        return res.json();
    })
    .then(data => {
        localStorage.setItem("token", data.token);  // KEPT AS localStorage
        window.location.href = "index.html";
    })
    .catch(err => {
        // Reset button on error
        btn.classList.remove('loading');
        btn.textContent = 'Login';
        msgEl.classList.add('show');
        
        document.getElementById("msg").innerText = "Invalid username or password";
    });
}


// REGISTER
function register(event) {
    event.preventDefault();

    const userName = document.getElementById("userName").value;
    const password = document.getElementById("password").value;
    const repeatPassword = document.getElementById("repeatPassword").value;

    if (password !== repeatPassword) {
        document.getElementById("msg").innerText = "Passwords do not match";
        return;
    }

    fetch(`${API_BASE}/users/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ userName, password, repeatPassword })
    })
    .then(res => {
        if (!res.ok) throw new Error("Register failed");
        return res.json();
    })
    .then(() => {
        window.location.href = "login.html";
    })
    .catch(() => {
        document.getElementById("msg").innerText = "Registration failed";
    });
}

