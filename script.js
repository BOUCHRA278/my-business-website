 // 1. Store the products added to the cart
    let cart = [];

    // 2. Find the HTML elements we need
    const cartCount = document.getElementById("cart-count");
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const clearButton = document.getElementById("clear-cart");

    // 3. Add a product when its button is clicked
    document.querySelectorAll(".product-button").forEach(function(button) {

        button.addEventListener("click", function() {

            const name = button.dataset.name;
            const price = Number(button.dataset.price);

            cart.push({
                name: name,
                price: price
            });

            updateCart();
        });

    });

    // 4. Update the shopping cart display
    function updateCart() {

        cartCount.textContent = cart.length;

        if (cart.length === 0) {
            cartItems.textContent = "Your cart is empty.";
        } else {
            cartItems.replaceChildren();

            cart.forEach(function(product) {
                const item = document.createElement("p");

                item.textContent =
                    product.name + " - $" +
                    product.price.toFixed(2);

                cartItems.appendChild(item);
            });
        }

        // Calculate the total price
        const total = cart.reduce(function(sum, product) {
            return sum + product.price;
        }, 0);

        cartTotal.textContent = total.toFixed(2);
    }

    // 5. Clear all products from the cart
    clearButton.addEventListener("click", function() {
        cart = [];
        updateCart();
    });
    
const contactForm = document.getElementById("contact-form");
const formFeedback = document.getElementById("form-feedback");

contactForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("customer-name").value.trim();

    formFeedback.textContent =
        "Thank you, " + name +
        "! Your form is working correctly.";

    contactForm.reset();
});