
const API_BASE = "http://localhost:8080/api";

// ✅ FIXED: Get token fresh each time
function getToken() {
    return localStorage.getItem("token");
}

// ✅ FIXED: Check token immediately and redirect if expired
function checkTokenAndRedirect() {
    const token = getToken();
    
    if (!token) {
        alert("Your session has expired. Please login again.");
        top.location.href = "login.html";
        return false;
    }
    return true; 
}

// ✅ FIXED: Check token on page load
if (!checkTokenAndRedirect()) {
    // Stop execution if token expired
} else {
    // Page loaded successfully
    document.getElementById("userForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        if (!checkTokenAndRedirect()) return;
        
        const token = getToken();
        const userName = document.getElementById("userName").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const response = await fetch(`${API_BASE}/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    userName,
                    password
                })
            });
        

            // ✅ FIXED: Handle session expiration (401/403)
            if (response.status === 401 || response.status === 403) {
                alert("Your session has expired. Please login again.");
                localStorage.removeItem("token");
                top.location.href = "login.html";
                return;
            }

            // ✅ FIXED: Handle duplicate username (409)
            if (response.status === 409) {
                alert("Username already exists! Please choose a different username.");
                return;
            }

            // ✅ FIXED: Handle other errors properly
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Failed to add user" }));
                alert(errorData.error || errorData.message || "Failed to add user");
                return;
            }

            alert("User added successfully");
            parent.clickMenu("userList.html");

        } catch (error) {
            console.error("Add user failed:", error);
            alert("Failed to add user");
        }
    });
}