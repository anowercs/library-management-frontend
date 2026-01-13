const API_BASE = "http://localhost:8080/api";
const token = localStorage.getItem("token");

if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
}

/* =========================================================
   COMMON HELPERS
========================================================= */

function loadCategories(select) {
    if (!select) return Promise.resolve();

    return fetch(`${API_BASE}/categories`, {
        headers: { Authorization: "Bearer " + token }
    })
    .then(res => res.json())
    .then(categories => {
        select.innerHTML = "";
        categories.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id;
            opt.textContent = c.categoryName;
            select.appendChild(opt);
        });
    });
}


/* =========================================================
   BOOK LIST PAGE
========================================================= */

function loadBooks() {
    const tbody = document.getElementById("bookBody");
    if (!tbody) return; // 🔴 ONLY list page

    fetch(`${API_BASE}/books`, {
        headers: { Authorization: "Bearer " + token }
    })
    .then(res => res.json())
    .then(renderBooks)
    .catch(err => {
        console.error(err);
    
    });
}

function renderBooks(books) {
    const tbody = document.getElementById("bookBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    books.forEach(b => {
        tbody.innerHTML += `
        <tr>
            <td>${b.id}</td>
            <td>${b.bookName}</td>
            <td>
                ${b.picture
                    ? `<img src="http://localhost:8080/images/${b.picture}" width="60">`
                    : ""}
            </td>
            <td>${b.category ? b.category.categoryName : ""}</td>
            <td>${b.description || ""}</td>
            <td>${b.remark || ""}</td>
            <td>
                <button class="btn btn-danger btn-sm"
                        onclick="deleteBook(${b.id})">Delete</button>
                <button class="btn btn-info btn-sm"
                        onclick="editBook(${b.id})">Edit</button>
            </td>
        </tr>`;
    });
}


/* =========================================================
   ADD BOOK PAGE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const addForm = document.getElementById("bookForm");
    if (!addForm) return; 

    const categorySelect = document.getElementById("categoryId");
    loadCategories(categorySelect);

    addForm.addEventListener("submit", e => {
        e.preventDefault();

        const fd = new FormData();
        fd.append("bookName", bookName.value);
        fd.append("description", description.value);
        fd.append("remark", remark.value);
        fd.append("categoryId", categorySelect.value);
        fd.append("file", file.files[0]);

        fetch(`${API_BASE}/books`, {
            method: "POST",
            headers: { Authorization: "Bearer " + token },
            body: fd
        })
        .then(res => {
            if (!res.ok) throw new Error();
            location.href = "bookList.html";
        })
        .catch(() => alert("Failed to add book"));
    });
});

/* =========================================================
   EDIT BOOK PAGE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const editForm = document.getElementById("editBookForm");
    if (!editForm) return;

    const id = new URLSearchParams(window.location.search).get("id");

    const bookName = document.getElementById("bookName");
    const categorySelect = document.getElementById("categoryId");
    const description = document.getElementById("description");
    const remark = document.getElementById("remark");
    const currentImage = document.getElementById("currentImage");
    const fileInput = document.getElementById("file");

    // 🔍 CHECK IF TOKEN EXISTS
    if (!token) {
        alert(" No authentication token found! Please log in again.");
        location.href = "login.html";
        return;
    }

    console.log("✅ Token exists:", token.substring(0, 20) + "...");
    console.log("📖 Loading book ID:", id);

    /* =========================
       LOAD CATEGORIES FIRST
    ========================= */
    loadCategories(categorySelect).then(() => {

        /* =========================
           LOAD BOOK DATA
        ========================= */
        const headers = {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        };

        console.log("🔐 Request headers:", headers);

        fetch(`${API_BASE}/books/${id}`, {
            method: "GET",
            headers: headers
        })
        .then(res => {
            console.log("📊 Response status:", res.status);
            console.log("📊 Response headers:", res.headers);

            if (!res.ok) {
                console.error(" Failed to load book:", res.status, res.statusText);
                if (res.status === 401) {
                    alert(" Unauthorized! Your session may have expired. Please log in again.");
                    location.href = "login.html";
                } else if (res.status === 403) {
                    alert("Forbidden! You don't have permission to view this book.");
                } else {
                    alert("Error loading book (Status: " + res.status + ")");
                }
                return null;
            }
            return res.json();
        })
        .then(b => {
            if (!b) return;

            console.log("✅ Book data loaded:", b);

            // ✅ Set all fields
            bookName.value = b.bookName || "";
            description.value = b.description || "";
            remark.value = b.remark || "";

            // ✅ Set category
            if (b.category && b.category.id) {
                setTimeout(() => {
                    categorySelect.value = b.category.id;
                    console.log("✅ Category set to:", b.category.id);
                }, 100);
            }

            // ✅ Set image
            if (b.picture) {
                currentImage.src = `http://localhost:8080/images/${b.picture}`;
                currentImage.style.display = "inline-block";
                console.log("✅ Image loaded:", b.picture);
            }
        })
        .catch(err => {
            console.error(" Error loading book:", err);
            alert(" Failed to load book data: " + err.message);
        });

    }).catch(err => {
        console.error("Error loading categories:", err);
        alert(" Failed to load categories");
    });

    /* =========================
       SUBMIT UPDATE
    ========================= */
    editForm.addEventListener("submit", e => {
        e.preventDefault();

        const fd = new FormData();

        fd.append("bookName", bookName.value);
        fd.append("description", description.value);
        fd.append("remark", remark.value);
        fd.append("categoryId", categorySelect.value);

        if (fileInput.files && fileInput.files.length > 0) {
            fd.append("file", fileInput.files[0]);
        }

        console.log("📤 Sending update for book:", id);

        fetch(`${API_BASE}/books/${id}`, {
            method: "PUT",
            headers: { 
                "Authorization": "Bearer " + token 
            },
            body: fd
        })
        .then(res => {
            if (!res.ok) {
                console.error("Update failed:", res.status);
                throw new Error("Update failed with status " + res.status);
            }
            console.log("✅ Book updated successfully!");
            alert("✅ Book updated successfully!");
            location.href = "bookList.html";
        })
        .catch(err => {
            console.error(" Update error:", err);
            alert(" Update failed: " + err.message);
        });
    });
});





function goAdd() {
    window.location.href = "bookAdd.html";
}

/* =========================================================
   INITIAL LOAD (BOOK LIST ONLY)
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("bookBody")) {
        loadBooks();
    }
});
