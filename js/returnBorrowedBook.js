const API_BASE = "http://localhost:8080/api";
const token = localStorage.getItem("token");

const studentSearch = document.getElementById("studentSearch");
const studentName = document.getElementById("studentName");
const borrowerId = document.getElementById("borrowerId");
const categorySelect = document.getElementById("categorySelect");
const borrowSelect = document.getElementById("borrowSelect");
const borrowDate = document.getElementById("borrowDate");
const returnDate = document.getElementById("returnDate");
const returnBtn = document.getElementById("returnBtn");

let borrowedRecords = [];

// default return date = today
returnDate.value = new Date().toISOString().split("T")[0];

/* =========================
   1️⃣ Search by Student No
   ========================= */
studentSearch.addEventListener("change", async () => {

    const studentNo = studentSearch.value.trim();
    if (!studentNo) return;

    console.log("Searching student:", studentNo);

    const res = await fetch(
        `${API_BASE}/borrows/student/${studentNo}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!res.ok) {
        alert("Failed to fetch borrowed books");
        return;
    }

    borrowedRecords = await res.json();
    console.log("Borrowed records:", borrowedRecords);

    if (borrowedRecords.length === 0) {
        alert("No active borrowed books found");
        return;
    }

    // Fill student info
    studentName.value = borrowedRecords[0].student.name;
    borrowerId.value = borrowedRecords[0].student.id;

    loadCategories();
});

/* =========================
   2️⃣ Load Categories
   ========================= */
function loadCategories() {

    categorySelect.innerHTML = `<option value="">-- Select Category --</option>`;

    const uniqueCategories = new Map();

    borrowedRecords.forEach(b => {
        uniqueCategories.set(
            b.book.category.id,
            b.book.category.categoryName
        );
    });

    uniqueCategories.forEach((name, id) => {
        const opt = document.createElement("option");
        opt.value = id;
        opt.textContent = name;
        categorySelect.appendChild(opt);
    });
}

categorySelect.addEventListener("change", () => {

    borrowSelect.innerHTML = `<option value="">-- Select Borrowed Book --</option>`;

    borrowedRecords
        .filter(b => b.book.category.id === Number(categorySelect.value))
        .forEach(b => {
            const opt = document.createElement("option");
            opt.value = b.id; // borrowId
            opt.textContent = b.book.bookName;
            borrowSelect.appendChild(opt);
        });
});

borrowSelect.addEventListener("change", () => {

    const record = borrowedRecords.find(
        b => b.id === Number(borrowSelect.value)
    );

    if (!record) {
        borrowDate.value = "";
        return;
    }

    // Ensure proper date format
    borrowDate.value = record.borrowDate;
});

returnBtn.addEventListener("click", async () => {

    if (!borrowSelect.value) {
        alert("Please select a borrowed book");
        return;
    }

    const borrowId = Number(borrowSelect.value);

    const res = await fetch(
        `${API_BASE}/borrows/${borrowId}/return?returnDate=${returnDate.value}`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!res.ok) {
        alert("Failed to return book");
        return;
    }

    alert("Book returned successfully");

    // ✅ Redirect to book search page
    window.location.href = "bookSearch.html";
});

/* =========================
   3️⃣ Load Borrowed Books
   ========================= */
categorySelect.addEve
