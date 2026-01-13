const API_BASE = "http://localhost:8080/api";
const token = localStorage.getItem("token");

if (!token) location.href = "login.html";

// -------- LIST --------
function loadCategories() {
    const keyword = document.getElementById("keyword")?.value || "";

    fetch(`${API_BASE}/categories?keyword=${keyword}`, {
        headers: { "Authorization": "Bearer " + token }
    })
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector("#categoryTable tbody");
            if (!tbody) return;

            tbody.innerHTML = "";
            data.forEach(c => {
                tbody.innerHTML += `
                <tr>
                    <td>${c.id}</td>
                    <td>${c.categoryName}</td>
                    <td>${c.remark || ""}</td>
                    <td>
                        <button class="btn btn-info btn-sm" onclick="edit(${c.id})">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="del(${c.id})">Delete</button>
                    </td>
                </tr>`;
            });

            $("#categoryTable").DataTable();
        });
}

// -------- ADD --------
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("categoryForm");
    if (!form) return;

    const categoryNameInput = document.getElementById("categoryName");
    const remarkInput = document.getElementById("remark");

    form.addEventListener("submit", e => {
        e.preventDefault();

        fetch(`${API_BASE}/categories`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                categoryName: categoryNameInput.value.trim(),
                remark: remarkInput.value.trim()
            })
        })

        .then(res => {
            if (!res.ok) throw new Error("Failed to add category");
            location.href = "bookCategoryList.html";
        })
        .catch(err => {
            console.error(err);
            alert("Failed to add book category");
        });
    });
});


// -------- EDIT --------
/*
if (document.getElementById("editCategoryForm")) {
    const id = new URLSearchParams(location.search).get("id");
    document.getElementById("id").value = id;

    fetch(`${API_BASE}/categories/${id}`, {
        headers: { "Authorization": "Bearer " + token }
    })
        .then(res => res.json())
        .then(c => {
            categoryName.value = c.categoryName;
            remark.value = c.remark || "";
        });

    editCategoryForm.addEventListener("submit", e => {
        e.preventDefault();

        fetch(`${API_BASE}/categories/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                categoryName: categoryName.value,
                remark: remark.value
            })
        }).then(() => location.href = "bookCategoryList.html");
    });
}

*/

// -------- EDIT --------
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("editCategoryForm");
    if (!form) return;

    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
        alert("Invalid category id");
        location.href = "bookCategoryList.html";
        return;
    }

    const categoryNameInput = document.getElementById("categoryName");
    const remarkInput = document.getElementById("remark");

    // 🔹 LOAD EXISTING DATA
    fetch(`${API_BASE}/categories/${id}`, {
        headers: { "Authorization": "Bearer " + token }
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to load category");
        return res.json();
    })
    .then(c => {
        categoryNameInput.value = c.categoryName;
        remarkInput.value = c.remark || "";
    })
    .catch(err => {
        console.error(err);
        alert("Unable to load category");
        location.href = "bookCategoryList.html";
    });

    // 🔹 SAVE UPDATE
    form.addEventListener("submit", e => {
        e.preventDefault();

        fetch(`${API_BASE}/categories/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                categoryName: categoryNameInput.value.trim(),
                remark: remarkInput.value.trim()
            })
        })
        .then(res => {
            if (!res.ok) throw new Error("Update failed");
            location.href = "bookCategoryList.html";
        })
        .catch(err => {
            console.error(err);
            alert("Update failed");
        });
    });
});


// -------- DELETE --------
function del(id) {
    if (!confirm("Delete this category?")) return;

    fetch(`${API_BASE}/categories/${id}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token }
    }).then(() => loadCategories());
}

function edit(id) {
    location.href = `bookCategoryEdit.html?id=${id}`;
}

function goAdd() {
    location.href = "bookCategoryAdd.html";
}

loadCategories();

