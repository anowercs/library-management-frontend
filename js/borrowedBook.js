const API_BASE = "http://localhost:8080/api";
const token = localStorage.getItem("token");

const tableBody = document.getElementById("borrowedTableBody");

document.addEventListener("DOMContentLoaded", loadBorrowedBooks);

async function loadBorrowedBooks() {

    const res = await fetch(
        `${API_BASE}/borrows/active`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!res.ok) {
        alert("Failed to load borrowed books");
        return;
    }

    const borrows = await res.json();
    tableBody.innerHTML = "";

    if (borrows.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    No borrowed books found
                </td>
            </tr>
        `;
        return;
    }

    borrows.forEach((b, index) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${b.student.no}</td>
            <td>${b.student.name}</td>
            <td>${b.book.bookName}</td>
            <td>${b.book.category.categoryName}</td>
            <td>${b.borrowDate}</td>
            <td>${b.dueDate}</td>
            <td>
                <span class="badge bg-warning text-dark">
                    Borrowed
                </span>
            </td>
        `;

        tableBody.appendChild(tr);
    });
}
