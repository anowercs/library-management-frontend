const API_BASE = "http://localhost:8080/api";
const token = localStorage.getItem("token");

if (!token) {
    alert("Please login first");
    location.href = "login.html";
}

// ===========================
// GET BOOK ID FROM URL
// ===========================
const params = new URLSearchParams(window.location.search);
const bookId = params.get("bookId");

if (!bookId) {
    alert("Invalid book");
    location.href = "books.html";
}

// ===========================
// PAGE LOAD
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    loadBook(bookId);
    loadStudents();
});

// ===========================
// LOAD SELECTED BOOK
// ===========================
function loadBook(id) {
    fetch(`${API_BASE}/books/${id}`, {
        headers: { Authorization: "Bearer " + token }
    })
    .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
    })
    .then(book => {
        document.getElementById("bookName").value = book.bookName;
    })
    .catch(() => alert("Failed to load book"));
}

// ===========================
// LOAD STUDENTS
// ===========================
function loadStudents() {
    fetch(`${API_BASE}/students`, {
        headers: { Authorization: "Bearer " + token }
    })
    .then(res => res.json())
    .then(students => {
        const select = document.getElementById("studentId");
        select.innerHTML = `<option value="">-- Select Student --</option>`;

        students.forEach(s => {
            const opt = document.createElement("option");
            opt.value = s.id;
            opt.textContent = `${s.no} - ${s.name}`;
            select.appendChild(opt);
        });
    })
    .catch(() => alert("Failed to load students"));
}

// ===========================
// BORROW BOOK
// ===========================
function borrow() {
    const studentId = document.getElementById("studentId").value;

    if (!studentId) {
        alert("Please select student");
        return;
    }

    fetch(`${API_BASE}/borrows?bookId=${bookId}&studentId=${studentId}`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token }
    })
    .then(res => {
        if (!res.ok) throw new Error();
        alert("Book borrowed successfully");
        location.href = "bookSearch.html";
    })
    .catch(() => {
        alert("Book already borrowed or error occurred");
    });
}
