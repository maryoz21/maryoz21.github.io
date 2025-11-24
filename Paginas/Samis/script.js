// Cart Logic
let cart = [];

function addToCart(name, price) {
    cart.push({ name, price });
    updateCartUI();
    
    // Simple feedback animation
    const cartIcon = document.getElementById('cart-icon');
    cartIcon.style.transform = 'scale(1.3)';
    setTimeout(() => {
        cartIcon.style.transform = 'scale(1)';
    }, 200);
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

// Section Toggle Logic
function toggleSection(id) {
    const section = document.getElementById(id);
    const icon = document.getElementById(`icon-${id}`);
    
    section.classList.toggle("oculto");
    
    if (icon) {
        if (section.classList.contains("oculto")) {
            icon.style.transform = "rotate(0deg)";
        } else {
            icon.style.transform = "rotate(180deg)";
        }
    }
}

// Mobile Menu Logic
document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById("menu-btn");
    const navList = document.getElementById("nav-list");

    if (menuBtn && navList) {
        menuBtn.addEventListener("click", () => {
            navList.classList.toggle("active");
        });
    }
    
    // Initialize Cart UI if present
    updateCartUI();
});
