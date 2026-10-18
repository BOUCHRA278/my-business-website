
import {
  collection,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { db } from "./firebase-config.js";

const $ = (id) => document.getElementById(id);

const container = document.querySelector(".product-container");

let products = [];
let selectedCategory = "all";
let selectedProduct = null;
let galleryIndex = 0;
let previousFocus = null;

let cart = [];

// Load saved shopping cart
try {
  const saved = JSON.parse(
    localStorage.getItem("cozyCart") || "[]"
  );

  if (Array.isArray(saved)) {
    cart = saved.filter((item) =>
      item &&
      typeof item.name === "string" &&
      Number.isFinite(item.price) &&
      item.price >= 0 &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
    );
  }
} catch (error) {
  cart = [];
}

function money(value) {
  return "$" + Number(value).toFixed(2);
}

function createButton(text, handler, className = "") {
  const button = document.createElement("button");

  button.type = "button";
  button.textContent = text;
  button.className = className;
  button.addEventListener("click", handler);

  return button;
}

// ==========================================
// SHOPPING CART
// ==========================================

function saveCart() {
  localStorage.setItem("cozyCart", JSON.stringify(cart));
}

function addToCart(product) {
  const existing = cart.find((item) =>
    item.id === product.id ||
    (!item.id && item.name === product.name)
  );

  if (existing) {
    existing.quantity++;
    existing.price = product.price;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  updateCart();
}

function changeQuantity(index, amount) {
  if (!cart[index]) return;

  cart[index].quantity += amount;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  updateCart();
}

function updateCart() {
  const cartItems = $("cart-items");

  cartItems.replaceChildren();

  let total = 0;
  let totalQuantity = 0;

  if (cart.length === 0) {
    const message = document.createElement("p");
    message.textContent = "Your cart is empty.";
    cartItems.appendChild(message);
  }

  cart.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "cart-item";

    const info = document.createElement("div");

    const name = document.createElement("strong");
    name.textContent = item.name;

    const price = document.createElement("p");
    price.textContent = money(item.price) + " each";

    info.append(name, price);

    const controls = document.createElement("div");
    controls.className = "quantity-controls";

    const quantity = document.createElement("span");
    quantity.textContent = item.quantity;

    controls.append(
      createButton("−", () => changeQuantity(index, -1)),
      quantity,
      createButton("+", () => changeQuantity(index, 1)),
      createButton("Remove", () => {
        cart.splice(index, 1);
        updateCart();
      })
    );

    row.append(info, controls);
    cartItems.appendChild(row);

    total += item.price * item.quantity;
    totalQuantity += item.quantity;
  });

  $("cart-count").textContent = totalQuantity;
  $("total-items").textContent = totalQuantity;
  $("cart-total").textContent = total.toFixed(2);

  saveCart();
}

$("clear-cart").addEventListener("click", () => {
  cart = [];
  updateCart();
});

updateCart();

// ==========================================
// SEARCH AND CATEGORY FILTER
// ==========================================

function visibleProducts() {
  const searchText = $("product-search")
    .value.trim().toLowerCase();

  return products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" ||
      product.category === selectedCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(searchText) ||
      (product.description || "")
        .toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });
}

function renderProducts() {
  container.replaceChildren();

  const visible = visibleProducts();

  $("no-products").hidden = visible.length > 0;

  visible.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const image = document.createElement("img");
    image.src = product.images[0];
    image.alt = product.name;
    image.loading = "lazy";

    const info = document.createElement("div");
    info.className = "product-info";

    const title = document.createElement("h3");
    title.textContent = product.name;

    const price = document.createElement("p");
    price.className = "price";
    price.textContent = money(product.price);

    const detailsButton = createButton(
      "View Details",
      () => openModal(product),
      "details-button"
    );

    const cartButton = createButton(
      "Add to Cart",
      () => addToCart(product),
      "button product-button"
    );

    info.append(
      title,
      price,
      detailsButton,
      cartButton
    );

    card.append(image, info);
    container.appendChild(card);
  });
}

$("product-search").addEventListener(
  "input",
  renderProducts
);

document.querySelectorAll(".filter-btn").forEach((button) => {
  button.addEventListener("click", () => {
    selectedCategory = button.dataset.filter;

    document.querySelectorAll(".filter-btn").forEach((item) => {
      item.classList.toggle("active", item === button);
    });

    renderProducts();
  });
});

// ==========================================
// LOAD PRODUCTS FROM FIREBASE
// ==========================================

const publishedQuery = query(
  collection(db, "products"),
  where("published", "==", true)
);

onSnapshot(
  publishedQuery,

  (snapshot) => {
    products = snapshot.docs
      .map((document) => ({
        id: document.id,
        ...document.data()
      }))
      .filter((product) =>
        typeof product.name === "string" &&
        Number.isFinite(product.price) &&
        Array.isArray(product.images) &&
        product.images.length > 0 &&
        typeof product.images[0] === "string"
      );

    renderProducts();
  },

  (error) => {
    container.replaceChildren();

    const message = document.createElement("p");
    message.textContent =
      "Products could not be loaded. Please try again later.";

    container.appendChild(message);
    $("no-products").hidden = true;

    console.error("Firestore error:", error);
  }
);

// ==========================================
// PRODUCT IMAGE GALLERY
// ==========================================

function showImage(index) {
  if (!selectedProduct) return;

  const images = selectedProduct.images;

  galleryIndex =
    (index + images.length) % images.length;

  $("modal-image").src = images[galleryIndex];

  $("modal-image").alt =
    selectedProduct.name +
    " photo " +
    (galleryIndex + 1);

  $("gallery-status").textContent =
    (galleryIndex + 1) + " / " + images.length;

  Array.from(
    $("gallery-thumbnails").children
  ).forEach((button, index) => {
    button.classList.toggle(
      "active",
      index === galleryIndex
    );
  });
}

function openModal(product) {
  selectedProduct = product;
  previousFocus = document.activeElement;

  $("modal-name").textContent = product.name;

  $("modal-description").textContent =
    product.description || "Handmade with love.";

  $("modal-price").textContent =
    money(product.price);

  const thumbnails = $("gallery-thumbnails");
  thumbnails.replaceChildren();

  product.images.forEach((url, index) => {
    const button = createButton(
      "",
      () => showImage(index)
    );

    const image = document.createElement("img");
    image.src = url;
    image.alt = "View photo " + (index + 1);

    button.appendChild(image);
    thumbnails.appendChild(button);
  });

  $("gallery-prev").hidden =
    product.images.length <= 1;

  $("gallery-next").hidden =
    product.images.length <= 1;

  showImage(0);

  $("product-modal").hidden = false;

  document.body.classList.add("modal-open");

  $("close-modal").focus();
}

function closeModal() {
  $("product-modal").hidden = true;

  document.body.classList.remove("modal-open");

  selectedProduct = null;

  if (previousFocus && previousFocus.isConnected) {
    previousFocus.focus();
  }
}

$("gallery-prev").addEventListener("click", () => {
  showImage(galleryIndex - 1);
});

$("gallery-next").addEventListener("click", () => {
  showImage(galleryIndex + 1);
});

$("close-modal").addEventListener(
  "click",
  closeModal
);

$("product-modal").addEventListener("click", (event) => {
  if (event.target === $("product-modal")) {
    closeModal();
  }
});

$("modal-add-cart").addEventListener("click", () => {
  if (selectedProduct) {
    addToCart(selectedProduct);
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if ($("product-modal").hidden) return;

  if (event.key === "Escape") {
    closeModal();
    return;
  }

  if (event.key === "ArrowLeft") {
    showImage(galleryIndex - 1);
  }

  if (event.key === "ArrowRight") {
    showImage(galleryIndex + 1);
  }

  if (event.key === "Tab") {
    const focusable = Array.from(
      $("product-modal").querySelectorAll(
        "button:not([hidden])"
      )
    ).filter((button) =>
      button.getClientRects().length > 0
    );

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey &&
        document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === last
    ) {
      event.preventDefault();
      first.focus();
    }
  }
});

// ==========================================
// CONTACT FORM (DEMO)
// ==========================================

$("contact-form").addEventListener("submit", (event) => {
  event.preventDefault();

  $("form-feedback").textContent =
    "This is a demo form. Your message has not been sent.";

  event.target.reset();
});

// ==========================================
// WHATSAPP ORDER
// ==========================================

// Public business number, with country code.
const businessWhatsApp = "96176552059";

$("whatsapp-order").addEventListener("click", () => {
  $("order-feedback").textContent = "";

  if (cart.length === 0) {
    $("order-feedback").textContent =
      "Please add products to your cart first.";
    return;
  }

  if (!/^\d{8,15}$/.test(businessWhatsApp)) {
    $("order-feedback").textContent =
      "Configure the business WhatsApp number.";
    return;
  }

  let message =
    "Hello! I would like to place an order from The Cozy Touch.\n\n" +
    "ORDER DETAILS:\n";

  let total = 0;

  cart.forEach((product) => {
    const subtotal =
      product.price * product.quantity;

    total += subtotal;

    message +=
      product.name +
      " x " +
      product.quantity +
      " = " +
      money(subtotal) +
      "\n";
  });

  message += "\nTOTAL: " + money(total);

  const customerName =
    $("order-name").value.trim();

  const notes =
    $("order-notes").value.trim();

  if (customerName) {
    message += "\nCustomer: " + customerName;
  }

  if (notes) {
    message += "\nSpecial Instructions: " + notes;
  }

  message +=
    "\n\nPlease confirm availability and final price.";

  const url =
    "https://wa.me/" +
    businessWhatsApp +
    "?text=" +
    encodeURIComponent(message);

  const opened = window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );

  if (!opened) {
    $("order-feedback").textContent =
      "If WhatsApp did not open, please allow pop-ups.";
  }
});
