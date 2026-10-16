
/* ==========================================
   THE COZY TOUCH
   FINAL JAVASCRIPT - LESSON 9
========================================== */


/* ==========================================
   LESSON 7 - ADVANCED SHOPPING CART
========================================== */

// Load saved shopping cart
let cart = [];

try {
    const savedCart = JSON.parse(
        localStorage.getItem("cozyCart")
    );

    if (Array.isArray(savedCart)) {
        cart = savedCart.filter(function(item) {
            return (
                typeof item.name === "string" &&
                Number.isFinite(item.price) &&
                item.price >= 0 &&
                Number.isInteger(item.quantity) &&
                item.quantity > 0
            );
        });
    }
} catch (error) {
    cart = [];
}


// Find shopping cart elements
const cartCount = document.getElementById("cart-count");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const totalItems = document.getElementById("total-items");
const clearButton = document.getElementById("clear-cart");


// Save shopping cart
function saveCart() {
    localStorage.setItem("cozyCart", JSON.stringify(cart));
}


// Add products to shopping cart
document.querySelectorAll(".product-button").forEach(function(button) {

    button.addEventListener("click", function() {

        const name = button.dataset.name;
        const price = Number(button.dataset.price);

        const existingProduct = cart.find(function(product) {
            return product.name === name;
        });

        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            cart.push({
                name: name,
                price: price,
                quantity: 1
            });
        }

        updateCart();
    });
});


// Increase or decrease quantity
function changeQuantity(index, amount) {

    cart[index].quantity += amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    updateCart();
}


// Remove product
function removeProduct(index) {
    cart.splice(index, 1);
    updateCart();
}


// Update shopping cart
function updateCart() {

    cartItems.replaceChildren();

    let total = 0;
    let quantity = 0;

    if (cart.length === 0) {
        const message = document.createElement("p");
        message.textContent = "Your cart is empty.";
        cartItems.appendChild(message);
    }

    cart.forEach(function(product, index) {

        const row = document.createElement("div");
        row.className = "cart-item";

        const info = document.createElement("div");

        const name = document.createElement("strong");
        name.textContent = product.name;

        const price = document.createElement("p");
        price.textContent =
            "$" + product.price.toFixed(2) + " each";

        info.appendChild(name);
        info.appendChild(price);

        const controls = document.createElement("div");
        controls.className = "quantity-controls";

        // Decrease quantity
        const minus = document.createElement("button");
        minus.type = "button";
        minus.textContent = "-";
        minus.setAttribute(
            "aria-label",
            "Decrease " + product.name
        );

        minus.addEventListener("click", function() {
            changeQuantity(index, -1);
        });

        // Display quantity
        const count = document.createElement("span");
        count.textContent = product.quantity;

        // Increase quantity
        const plus = document.createElement("button");
        plus.type = "button";
        plus.textContent = "+";
        plus.setAttribute(
            "aria-label",
            "Increase " + product.name
        );

        plus.addEventListener("click", function() {
            changeQuantity(index, 1);
        });

        // Remove product
        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "Remove";

        remove.addEventListener("click", function() {
            removeProduct(index);
        });

        controls.append(minus, count, plus, remove);
        row.append(info, controls);
        cartItems.appendChild(row);

        total += product.price * product.quantity;
        quantity += product.quantity;
    });

    cartCount.textContent = quantity;
    totalItems.textContent = quantity;
    cartTotal.textContent = total.toFixed(2);

    saveCart();
}


// Clear shopping cart
clearButton.addEventListener("click", function() {
    cart = [];
    updateCart();
});


// Display saved cart
updateCart();



/* ==========================================
   LESSON 8 - WHATSAPP ORDERING SYSTEM
========================================== */

// Replace with your business WhatsApp number.
// Use country code without + or spaces.
const businessWhatsApp = "96176552059";

const whatsappButton =
    document.getElementById("whatsapp-order");

const orderFeedback =
    document.getElementById("order-feedback");


whatsappButton.addEventListener("click", function() {

    orderFeedback.textContent = "";

    // Check if cart is empty
    if (cart.length === 0) {
        orderFeedback.textContent =
            "Please add products to your cart first.";
        return;
    }

    // Check WhatsApp number
    if (!/^\d{8,15}$/.test(businessWhatsApp)) {
        orderFeedback.textContent =
            "Please configure the business WhatsApp number.";
        return;
    }

    // Get customer details
    const customerName =
        document.getElementById("order-name").value.trim();

    const orderNotes =
        document.getElementById("order-notes").value.trim();

    // Prepare order message
    let message =
        "Hello! I would like to place an order from The Cozy Touch.\n\n";

    message += "ORDER DETAILS:\n";

    let total = 0;

    cart.forEach(function(product) {

        const subtotal =
            product.price * product.quantity;

        message +=
            product.name +
            " x " + product.quantity +
            " = $" + subtotal.toFixed(2) + "\n";

        total += subtotal;
    });

    message += "\nTOTAL: $" + total.toFixed(2);

    if (customerName) {
        message += "\nCustomer: " + customerName;
    }

    if (orderNotes) {
        message += "\nSpecial Instructions: " + orderNotes;
    }

    message +=
        "\n\nPlease confirm availability and the final price.";

    // Encode order message
    const encodedMessage = encodeURIComponent(message);

    // Create WhatsApp link
    const whatsappURL =
        "https://wa.me/" +
        businessWhatsApp +
        "?text=" +
        encodedMessage;

    // Open WhatsApp
    const newWindow = window.open(
        whatsappURL,
        "_blank",
        "noopener,noreferrer"
    );

    if (!newWindow) {
        orderFeedback.textContent =
            "Please allow pop-ups to open WhatsApp.";
    }
});



/* ==========================================
   LESSON 9 - PRODUCT SEARCH AND FILTERS
========================================== */

// Find HTML elements
const searchInput =
    document.getElementById("product-search");

const filterButtons =
    document.querySelectorAll(".filter-btn");

const productCards =
    document.querySelectorAll(".product-card");

const noProductsMessage =
    document.getElementById("no-products");


// Default category
let selectedCategory = "all";


// Search and filter function
function filterProducts() {

    const searchText =
        searchInput.value.toLowerCase().trim();

    let visibleProducts = 0;

    productCards.forEach(function(card) {

        const productName =
            card.querySelector("h3").textContent.toLowerCase();

        const productCategory =
            card.dataset.category;

        const matchesSearch =
            productName.includes(searchText);

        const matchesCategory =
            selectedCategory === "all" ||
            productCategory === selectedCategory;

        if (matchesSearch && matchesCategory) {
            card.hidden = false;
            visibleProducts++;
        } else {
            card.hidden = true;
        }
    });

    noProductsMessage.hidden =
        visibleProducts !== 0;
}


// Search while typing
searchInput.addEventListener("input", filterProducts);


// Filter by category
filterButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        selectedCategory = button.dataset.filter;

        // Remove active state from all buttons
        filterButtons.forEach(function(btn) {
            btn.classList.remove("active");
        });

        // Highlight selected category
        button.classList.add("active");

        // Update products
        filterProducts();
    });
});


// Display products when page loads
filterProducts();



/* ==========================================
   CONTACT FORM - DEMONSTRATION
========================================== */

const contactForm =
    document.getElementById("contact-form");

const formFeedback =
    document.getElementById("form-feedback");

contactForm.addEventListener("submit", function(event) {

    event.preventDefault();

    formFeedback.textContent =
        "Thank you! This is a demo form. Your message has not been sent.";

    contactForm.reset();
});
