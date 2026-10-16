
// LESSON 7 - ADVANCED SHOPPING CART

// 1. Load the saved cart or start with an empty cart
let cart = [];

try {
    const savedCart = JSON.parse(localStorage.getItem("cozyCart"));

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

// 2. Find the HTML elements
const cartCount = document.getElementById("cart-count");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const totalItems = document.getElementById("total-items");
const clearButton = document.getElementById("clear-cart");

// 3. Save the cart in the browser
function saveCart() {
    localStorage.setItem("cozyCart", JSON.stringify(cart));
}

// 4. Add products to the cart
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

// 5. Increase or decrease product quantity
function changeQuantity(index, amount) {
    cart[index].quantity += amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    updateCart();
}

// 6. Remove one product completely
function removeProduct(index) {
    cart.splice(index, 1);
    updateCart();
}

// 7. Display the shopping cart
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

        const minus = document.createElement("button");
        minus.textContent = "-";
        minus.type = "button";
        minus.setAttribute("aria-label", "Decrease " + product.name);
        minus.addEventListener("click", function() {
            changeQuantity(index, -1);
        });

        const count = document.createElement("span");
        count.textContent = product.quantity;

        const plus = document.createElement("button");
        plus.textContent = "+";
        plus.type = "button";
        plus.setAttribute("aria-label", "Increase " + product.name);
        plus.addEventListener("click", function() {
            changeQuantity(index, 1);
        });

        const remove = document.createElement("button");
        remove.textContent = "Remove";
        remove.type = "button";
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

// 8. Clear the cart
clearButton.addEventListener("click", function() {
    cart = [];
    updateCart();
});

// 9. Display saved products when the page loads
updateCart();

// LESSON 8 - WHATSAPP ORDERING SYSTEM

// Replace this with your business WhatsApp number.
// Use international format without + or spaces.
const businessWhatsApp = "96176552059";

const whatsappButton = document.getElementById("whatsapp-order");
const orderFeedback = document.getElementById("order-feedback");

whatsappButton.addEventListener("click", function() {

    // Check if the shopping cart is empty
    if (cart.length === 0) {
        orderFeedback.textContent =
            "Please add products to your cart first.";
        return;
    }

    // Check if the business number has been configured
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

    // Build the order message
    let message = "Hello! I would like to place an order from The Cozy Touch.\n\n";

    message += "ORDER DETAILS:\n";

    let total = 0;

    cart.forEach(function(product) {

        const subtotal = product.price * product.quantity;

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

    message += "\n\nPlease confirm availability and the final price.";

    // Encode the message for use in a URL
    const encodedMessage = encodeURIComponent(message);

    // Build the WhatsApp URL
    const whatsappURL =
        "https://wa.me/" +
        businessWhatsApp +
        "?text=" +
        encodedMessage;

    // Open WhatsApp in a new tab
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
