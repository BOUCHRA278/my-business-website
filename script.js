
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
