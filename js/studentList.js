const API_BASE = "http://localhost:8080/api";
const token = localStorage.getItem("token");

/* ======================
   AUTH CHECK
====================== */
if (!token) {
    alert("Session expired. Please login again.");
    window.location.href = "login.html";
}

/* ======================
   ADD STUDENT
====================== */
function addStudent() {
    const student = {
        no: document.getElementById("no").value.trim(),
        name: document.getElementById("name").value.trim(),
        age: document.getElementById("age").value,
        gender: document.getElementById("gender").value
    };

    fetch(`${API_BASE}/students`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(student)
    })
        .then(res => {
            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("token");
                window.location.href = "login.html";
                return;
            }
            if (!res.ok) throw new Error("Add failed");
            return res.json();
        })
        .then(() => {
            alert("Student added successfully");
            window.location.href = "studentList.html";
        })
        .catch(err => {
            console.error(err);
            alert("Student add failed");
        });
}

/* ======================
   EDIT STUDENT
====================== */
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("editStudentForm");
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        alert("Student ID missing");
        window.location.href = "studentList.html";
        return;
    }

    fetch(`${API_BASE}/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(res => {
            if (!res.ok) throw new Error("Fetch failed");
            return res.json();
        })
        .then(s => {
            document.getElementById("no").value = s.no;
            document.getElementById("name").value = s.name;
            document.getElementById("age").value = s.age ?? "";
            document.getElementById("gender").value = s.gender ?? "";
        })
        .catch(() => {
            alert("Unable to load student");
            window.location.href = "studentList.html";
        });

    form.addEventListener("submit", e => {
        e.preventDefault();

        const student = {
            no: document.getElementById("no").value.trim(),
            name: document.getElementById("name").value.trim(),
            age: document.getElementById("age").value,
            gender: document.getElementById("gender").value
        };

        fetch(`${API_BASE}/students/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(student)
        })
            .then(res => {
                if (!res.ok) throw new Error();
                window.location.href = "studentList.html";
            })
            .catch(() => alert("Update failed"));
    });
});

/* ======================
   STUDENT SEARCH (DROPDOWN)
====================== */
const studentSearch = document.getElementById("studentSearch");
const studentSelect = document.getElementById("studentId");

if (studentSearch && studentSelect) {
    studentSearch.addEventListener("input", () => {
        const keyword = studentSearch.value.trim();

        if (!keyword) {
            studentSelect.innerHTML = "";
            return;
        }

        fetch(`${API_BASE}/students/search?keyword=${encodeURIComponent(keyword)}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(renderStudents)
            .catch(() => studentSelect.innerHTML = "");
    });
}

function renderStudents(students) {
    studentSelect.innerHTML = "";

    if (!students || students.length === 0) {
        const opt = document.createElement("option");
        opt.textContent = "No students found";
        opt.disabled = true;
        studentSelect.appendChild(opt);
        return;
    }

    students.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s.id;
        opt.textContent = `${s.no} - ${s.name}`;
        studentSelect.appendChild(opt);
    });
}

/* ======================
   STUDENT LIST
====================== */
function loadStudents(keyword = "") {
    fetch(`${API_BASE}/students?keyword=${encodeURIComponent(keyword)}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(res => {
            if (!res.ok) throw new Error("Load failed");
            return res.json();
        })
        .then(data => {
            const tbody = document.querySelector("#studentTable tbody");
            if (!tbody) return;

            tbody.innerHTML = "";

            data.forEach(s => {
                tbody.innerHTML += `
                <tr>
                    <td>${s.id}</td>
                    <td>${s.no}</td>
                    <td>${s.name}</td>
                    <td>${s.age || ""}</td>
                    <td>${s.gender || ""}</td>
                    <td>
                        <button class="btn btn-info btn-sm" onclick="edit(${s.id})">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="del(${s.id})">Delete</button>
                    </td>
                </tr>`;
            });

            if ($.fn.DataTable.isDataTable("#studentTable")) {
                $("#studentTable").DataTable().destroy();
            }

            $("#studentTable").DataTable();
        })
        .catch(err => console.error(err));
}

/* ======================
   DELETE
====================== */
function del(id) {
    if (!confirm("Delete this student?")) return;

    fetch(`${API_BASE}/students/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(({ status, body }) => {
        if (status === 200 || status === 204) {
            // Success - load the studentList.html page
            alert(body.message || "Student deleted successfully");
            window.location.href = "studentList.html";
        } else if (status === 409) {
            // Conflict - student has active borrows
            alert("❌ " + body.error);
        } else {
            // Other error
            alert("Error: " + (body.message || body.error || "Failed to delete"));
        }
    })
    .catch(err => {
        console.error("Delete error:", err);
        alert("Network error: " + err.message);
    });
}

function edit(id) {
    window.location.href = `studentEdit.html?id=${id}`;
}

function goAdd() {
    window.location.href = "studentAdd.html";
}

/* ======================
   INIT
====================== */
document.addEventListener("DOMContentLoaded", () => {
    loadStudents();
});
