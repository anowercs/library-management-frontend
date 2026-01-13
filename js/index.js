/**
 * Index JS – FIXED: Prevents Nested Login Pages
 * Enhanced with Responsive Mobile Menu Support
 */

const API_BASE_URL = "http://localhost:8080/api";
const TOKEN_KEY = "token";

/* ================== INIT ================== */
$(document).ready(function () {
    if (!isAuthenticated()) return;

    initMenu();
    initIframeLoader();
    initMobileMenu();
    initResponsiveHandlers();
    showUsernameFromToken();
});

/* ================== AUTH ================== */
function isAuthenticated() {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

function signOut() {
    if (confirm("Are you sure you want to sign out?")) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("user");
        window.location.href = "login.html";
    }
}

/* ================== JWT USERNAME ================== */
function showUsernameFromToken() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        $("#userName").text(payload.sub || "User");
    } catch (e) {
        console.error("Error parsing JWT:", e);
        $("#userName").text("User");
    }
}

/* ================== MENU ================== */
function initMenu() {
    $(".menuBar").click(function () {
        $(this)
            .toggleClass("list")
            .next().slideToggle()
            .parent()
            .siblings()
            .children("a")
            .removeClass("list")
            .next().slideUp();
        return false;
    });
}

/* ================== MOBILE MENU ================== */
function initMobileMenu() {
    // Ensure menu is visible on desktop
    if (window.innerWidth > 768) {
        $("#menu").removeClass("active");
        $(".idx-menu-overlay").removeClass("active");
        $(".idx-mobile-menu-toggle").removeClass("active");
    }
}

function toggleMobileMenu() {
    const menu = $("#menu");
    const overlay = $(".idx-menu-overlay");
    const toggle = $(".idx-mobile-menu-toggle");
    
    menu.toggleClass("active");
    overlay.toggleClass("active");
    toggle.toggleClass("active");
    
    // Prevent body scroll when menu is open
    if (menu.hasClass("active")) {
        $("body").css("overflow", "hidden");
    } else {
        $("body").css("overflow", "");
    }
}

function closeMobileMenu() {
    $("#menu").removeClass("active");
    $(".idx-menu-overlay").removeClass("active");
    $(".idx-mobile-menu-toggle").removeClass("active");
    $("body").css("overflow", "");
}

/* ================== RESPONSIVE HANDLERS ================== */
function initResponsiveHandlers() {
    // Close mobile menu when clicking on menu items
    $("#menu a").not(".menuBar").click(function() {
        if (window.innerWidth <= 768) {
            setTimeout(closeMobileMenu, 300);
        }
    });
    
    // Handle window resize
    let resizeTimer;
    $(window).resize(function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        }, 250);
    });
    
    // Handle orientation change
    $(window).on("orientationchange", function() {
        setTimeout(function() {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        }, 100);
    });
}

/* ================== IFRAME ================== */
function clickMenu(url) {
    $("#loadingDialog").show();
    $("#iframe").attr("src", url);
}

function initIframeLoader() {
    const iframe = document.getElementById("iframe");
    if (iframe) {
        iframe.onload = () => $("#loadingDialog").hide();
    }
}

/* ================== API ================== */
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem(TOKEN_KEY);

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        // TOKEN EXPIRED / INVALID - Redirect MAIN window, not iframe
        if (response.status === 401 || response.status === 403) {
            handleSessionExpired();
            return null;
        }

        return response;

    } catch (error) {
        console.error("API error:", error);
        throw error;
    }
}

function handleSessionExpired() {
    alert("Your session has expired. Please login again.");
    
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("user");
    
    // FIXED: Use top.location to redirect the main window, not the iframe
    parent.location.href = "login.html";
}

/* ================== CRUD HELPERS ================== */
async function deleteEntity(endpoint, successMsg) {
    if (!confirm("Are you sure?")) return false;

    try {
        const res = await apiRequest(endpoint, { method: "DELETE" });
        
        if (res && res.ok) {
            alert(successMsg);
            return true;
        }
        
        alert("Operation failed");
        return false;
    } catch (error) {
        console.error("Delete error:", error);
        alert("Error during deletion");
        return false;
    }
}

/* ================== UTILITY FUNCTIONS ================== */
async function getData(endpoint) {
    try {
        const response = await apiRequest(endpoint, { method: "GET" });
        if (response && response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error("Get data error:", error);
        return null;
    }
}

async function postData(endpoint, data) {
    try {
        const response = await apiRequest(endpoint, {
            method: "POST",
            body: JSON.stringify(data)
        });
        if (!response || !response.ok) {
            throw new Error(`HTTP ${response?.status}`);
        }
        return response;
    } catch (error) {
        console.error("Post data error:", error);
        throw error;
    }
}

async function updateData(endpoint, data) {
    try {
        const response = await apiRequest(endpoint, {
            method: "PUT",
            body: JSON.stringify(data)
        });
        if (!response || !response.ok) {
            throw new Error(`HTTP ${response?.status}`);
        }
        return response;
    } catch (error) {
        console.error("Update data error:", error);
        throw error;
    }
}

/* ================== EXPORT FOR IFRAMES ================== */
window.clickMenu = clickMenu;
window.signOut = signOut;
window.changePassword = () => clickMenu("changePassword.html");
window.apiRequest = apiRequest;
window.getData = getData;
window.postData = postData;
window.updateData = updateData;
window.deleteEntity = deleteEntity;
window.toggleMobileMenu = toggleMobileMenu;