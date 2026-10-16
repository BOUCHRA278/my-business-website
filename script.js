
/* ==========================================
   THE COZY TOUCH
   FINAL JAVASCRIPT - LESSON 10
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
                item !== null &&
                typeof item.name === "string" &&
                typeof item.price === "number" &&
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


// Add a product to the shopping cart
function addProductToCart(name, price) {

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
}


// Add products using the normal Add to Cart buttons
document.querySelectorAll(".product-button").forEach(function(button) {

    button.addEventListener("click", function() {

        const name = button.dataset.name;
        const price = Number(button.dataset.price);

        addProductToCart(name, price);
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

        // Product information
        const info = document.createElement("div");

        const name = document.createElement("strong");
        name.textContent = product.name;

        const price = document.createElement("p");
        price.textContent =
            "$" + product.price.toFixed(2) + " each";

        info.appendChild(name);
        info.appendChild(price);

        // Quantity controls
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

    // Update totals
    cartCount.textContent = quantity;
    totalItems.textContent = quantity;
    cartTotal.textContent = total.toFixed(2);

    // Save changes
    saveCart();
}


// Clear shopping cart
clearButton.addEventListener("click", function() {

    cart = [];
    updateCart();
});


// Display saved cart when page loads
updateCart();



/* ==========================================
   LESSON 8 - WHATSAPP ORDERING SYSTEM
========================================== */

// Business WhatsApp number
// Use country code without + or spaces.
// Only use a number intended for public business contact.
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

    // Create WhatsApp link
    const whatsappURL =
        "https://wa.me/" +
        businessWhatsApp +
        "?text=" +
        encodeURIComponent(message);

    // Open WhatsApp
    const newWindow = window.open(
        whatsappURL,
        "_blank",
        "noopener,noreferrer"
    );

    if (!newWindow) {
        orderFeedback.textContent =
            "If WhatsApp did not open, please allow pop-ups.";
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



/* ==========================================
   LESSON 10 - PRODUCT DETAILS POPUP
========================================== */

// Find popup elements
const productModal =
    document.getElementById("product-modal");

const modalImage =
    document.getElementById("modal-image");

const modalName =
    document.getElementById("modal-name");

const modalDescription =
    document.getElementById("modal-description");

const modalPrice =
    document.getElementById("modal-price");

const closeModalButton =
    document.getElementById("close-modal");

const modalAddCart =
    document.getElementById("modal-add-cart");


// Store the selected product
let selectedProduct = null;
let previousFocus = null;


// Open product details
document.querySelectorAll(".details-button").forEach(function(button) {

    button.addEventListener("click", function() {

        // Find the product card
        const card = button.closest(".product-card");

        // Find product information
        const image = card.querySelector("img");
        const name = card.querySelector("h3").textContent;

        const cartButton =
            card.querySelector(".product-button");

        const price = Number(cartButton.dataset.price);

        // Save selected product
        selectedProduct = {
            name: name,
            price: price
        };

        // Display product information
        modalImage.src = image.src;
        modalImage.alt = image.alt;

        modalName.textContent = name;

        modalDescription.textContent =
            button.dataset.description;

        modalPrice.textContent =
            "$" + price.toFixed(2);

        // Remember where keyboard focus was
        previousFocus = document.activeElement;

        // Show popup
        productModal.hidden = false;

        // Prevent scrolling behind popup
        document.body.classList.add("modal-open");

        // Focus close button
        closeModalButton.focus();
    });
});


// Close product details
function closeProductModal() {

    productModal.hidden = true;

    document.body.classList.remove("modal-open");

    selectedProduct = null;

    // Return focus to the View Details button
    if (previousFocus) {
        previousFocus.focus();
    }
}


// Close popup using X button
closeModalButton.addEventListener(
    "click",
    closeProductModal
);


// Close popup when clicking outside
productModal.addEventListener("click", function(event) {

    if (event.target === productModal) {
        closeProductModal();
    }
});


// Close popup with Escape key
document.addEventListener("keydown", function(event) {

    if (productModal.hidden) {
        return;
    }

    if (event.key === "Escape") {
        closeProductModal();
        return;
    }

    // Keep keyboard focus inside popup
    if (event.key === "Tab") {

        const focusableElements = [
            closeModalButton,
            modalAddCart
        ];

        const currentIndex =
            focusableElements.indexOf(document.activeElement);

        if (event.shiftKey && currentIndex <= 0) {

            event.preventDefault();
            modalAddCart.focus();

        } else if (
            !event.shiftKey &&
            currentIndex === 1
        ) {

            event.preventDefault();
            closeModalButton.focus();
        }
    }
});


// Add selected product to cart from popup
modalAddCart.addEventListener("click", function() {

    if (!selectedProduct) {
        return;
    }

    // Reuse the existing shopping cart function
    addProductToCart(
        selectedProduct.name,
        selectedProduct.price
    );

    // Close popup after adding product
    closeProductModal();
});
