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
    const keyword = document.getElementById("keyword") ? document.getElementById("keyword").value : "";

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

// -------- LOAD USER EDIT PAGE --------
async function loadUserEdit() {
    if (!checkTokenAndRedirect()) return;

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("id");

    if (!userId) {
        alert("User ID not found");
        window.location.href = "userList.html";
        return;
    }

    const token = getToken();

    try {
        const response = await fetch(`${API_BASE}/users/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (response.status === 401 || response.status === 403) {
            alert("Session expired. Please login again.");
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) throw new Error("Failed to load user");

        const user = await response.json();

        // Display current ID (read-only)
        document.getElementById("currentId").textContent = user.id;
        
        // Display current username (read-only)
        document.getElementById("currentUserName").textContent = user.userName;
        
        // Store ID in hidden input
        document.getElementById("id").value = user.id;

    } catch (err) {
        console.error(err);
        alert("Failed to load user data");
        window.location.href = "userList.html";
    }
}

// -------- UPDATE USER --------
async function updateUser(event) {
    event.preventDefault();

    if (!checkTokenAndRedirect()) return;

    const id = document.getElementById("id").value;
    const newUserName = document.getElementById("newUserName").value.trim();
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;

    // Validation
    if (!newUserName) {
        alert("New username is required!");
        return;
    }

    if (!currentPassword) {
        alert("Current password is required!");
        return;
    }

    if (!newPassword) {
        alert("New password is required!");
        return;
    }

    const token = getToken();

    try {
        // First, get current user to verify current password
        const getUserResponse = await fetch(`${API_BASE}/users/${id}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!getUserResponse.ok) throw new Error("Failed to verify user");

        const currentUser = await getUserResponse.json();

        // Check if current password is correct
        if (currentUser.password !== currentPassword) {
            alert("Current password is incorrect!");
            return;
        }

        // Update user with new username and password
        const updateResponse = await fetch(`${API_BASE}/users/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                id: id,
                userName: newUserName,
                password: newPassword
            })
        });

        if (updateResponse.status === 401 || updateResponse.status === 403) {
            alert("Session expired. Please login again.");
            window.location.href = "login.html";
            return;
        }

        if (updateResponse.status === 409) {
            alert("Username already exists!");
            return;
        }

        if (!updateResponse.ok) {
            const error = await updateResponse.json();
            alert(error.error || "Failed to update user");
            return;
        }

        alert("User updated successfully!");
        window.location.href = "userList.html";

    } catch (err) {
        console.error(err);
        alert("Error: " + err.message);
    }
}

// -------- DELETE --------
/*
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
        if (res) {
            alert("User deleted successfully!");
            loadUsers();
        }
    });
}
*/

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
        if (res) {
            alert("User deleted successfully!");
            window.location.href = "userList.html";
        }
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

// Change Password
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

// ✅ Page load - Call appropriate function based on current page
if (!checkTokenAndRedirect()) {
    // Stop execution if token expired
} else {
    // Load users list page
    if (document.getElementById("userTable")) {
        loadUsers();
    }
    // Load user edit page
    if (document.getElementById("editUserForm")) {
        loadUserEdit();
    }
}