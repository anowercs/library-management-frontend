const API_BASE = "http://localhost:8080/api";
const token = localStorage.getItem("token");

if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
}


/* ===============================
   LOAD ALL BOOKS ON PAGE OPEN
================================ */
function loadAllBooks() {
    fetch(`${API_BASE}/books/available`, {   // ✅ FIXED
        headers: { Authorization: "Bearer " + token }
    })
    .then(res => {
        if (!res.ok) throw new Error(res.status);
        return res.json();
    })
    .then(renderBookGrid)
    .catch(err => {
        console.error(err);
        alert("Failed to load books");
    });
}

/* ===============================
   SEARCH BOOKS
================================ */
function searchBooks() {
    const keyword = document.getElementById("keyword").value.trim();

    const url = keyword
        ? `${API_BASE}/books/available?keyword=${encodeURIComponent(keyword)}` // ✅ FIXED
        : `${API_BASE}/books/available`;                                      // ✅ FIXED

    fetch(url, {
        headers: { Authorization: "Bearer " + token }
    })
    .then(res => {
        if (!res.ok) throw new Error(res.status);
        return res.json();
    })
    .then(renderBookGrid)
    .catch(err => {
        console.error("Search failed:", err);
        alert("Failed to search books");
    });
}


function renderBookGrid(books) {
    const container = document.getElementById("bookContainer");
    container.innerHTML = "";

    books.forEach(b => {

        const unavailable = !b.available;

        container.innerHTML += `
        <div class="col-md-3 mb-4">
            <div class="card h-100 shadow-sm ${unavailable ? 'border-danger' : ''}">
                
                ${b.picture ? `
                    <img src="http://localhost:8080/images/${b.picture}"
                         class="card-img-top thumbnail">
                ` : ""}

                <div class="card-body">
                    <h5 class="card-title">
                        ${b.bookName}
                    </h5>

                    <p>
                        <strong>Category:</strong>
                        ${b.category?.categoryName || ""}
                    </p>

                    ${unavailable
                        ? `<span class="badge bg-danger">Not Available</span>`
                        : `<span class="badge bg-success">Available</span>`
                    }

                    <div class="mt-3">
                        <button class="btn btn-sm
                                ${unavailable ? 'btn-secondary' : 'btn-success'}"
                                ${unavailable ? "disabled" : ""}
                                onclick="openBorrowPage(${b.id})">
                            Borrow
                        </button>

                    </div>
                </div>
            </div>
        </div>`;
    });
}

function openBorrowPage(bookId) {
    window.location.href = `borrowBook.html?bookId=${bookId}`;
}



/* ===============================
   INIT
================================ */
document.addEventListener("DOMContentLoaded", loadAllBooks);
