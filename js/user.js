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
        parent.location.href = "login.html";
        return false;
    }
    return true;
}

// ✅ FIXED: Validate token with backend before loading
async function validateToken() {
    const token = getToken();
    
    if (!token) return false;
    
    try {
        const response = await fetch(`${API_BASE}/users`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });
        
        if (response.status === 401 || response.status === 403) {
            return false;
        }
        return response.ok;
    } catch {
        return false;
    }
}

// -------- LOAD USERS --------
async function loadUsers() {
    if (!checkTokenAndRedirect()) return;
    
    const token = getToken();
    const keyword = document.getElementById("keyword").value || "";

    let url = `${API_BASE}/users`;
    if (keyword) {
        url += `?keyword=${keyword}`;
    }

    fetch(url, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
        .then(res => {
            if (res.status === 401 || res.status === 403) {
                alert("Your session has expired. Please login again.");
                parent.location.href = "login.html";
                return null;
            }
            if (!res.ok) throw new Error("Unauthorized");
            return res.json();
        })
        .then(data => {
            if (!data) return;
            
            const tbody = document.querySelector("#userTable tbody");
            tbody.innerHTML = "";

            data.forEach(u => {
                tbody.innerHTML += `
                <tr>
                    <td>${u.id}</td>
                    <td>${u.userName}</td>
                    <td>${u.password ?? ""}</td>
                    <td>
                        <button class="btn btn-info btn-xs" onclick="edit(${u.id})">Edit</button>
                        <button class="btn btn-danger btn-xs" onclick="del(${u.id})">Delete</button>
                    </td>
                </tr>
                `;
            });

            if ($.fn.DataTable.isDataTable("#userTable")) {
                $("#userTable").DataTable().destroy();
            }
            $("#userTable").DataTable();
        })
        .catch(err => {
            alert("Failed to load users (check JWT / backend)");
            console.error(err);
        });
}


//Change Password

// ======================================================
// ADD THESE FUNCTIONS TO user.js
// Copy and paste at the end of your user.js file
// ======================================================

function changePassword() {
    const token = localStorage.getItem("token");

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        alert("All fields are required!");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("New passwords do not match!");
        return;
    }

    fetch(`${API_BASE}/users/password`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            currentPassword,
            newPassword
        })
    })
    .then(res => {
        if (res.status === 401 || res.status === 403) {
            alert("Session expired");
            window.location.href = "login.html";
            return null;
        }
        return res.text();
    })
    .then(result => {
        if (result === "true") {
            alert("Password changed successfully!");
            window.history.back();
        } else {
            alert("Current password is incorrect.");
        }
    })
    .catch(err => {
        console.error(err);
        alert("Server error");
    });
}





// -------- DELETE --------
function del(id) {
    if (!confirm("Are you sure to delete this user?")) return;

    if (!checkTokenAndRedirect()) return;
    
    const token = getToken();

    fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => {
        if (res.status === 401 || res.status === 403) {
            alert("Your session has expired. Please login again.");
            parent.location.href = "login.html";
            return null;
        }
        return res;
    })
    .then(res => {
        if (res) loadUsers();
    });
}

// -------- EDIT --------
function edit(id) {
    window.location.href = `userEdit.html?id=${id}`;
}

// -------- ADD --------
function goAdd() {
    window.location.href = "userAdd.html";
}

// ✅ FIXED: Check token before initial load
if (!checkTokenAndRedirect()) {
    // Stop execution if token expired
} else {
    loadUsers();
}