
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {
  auth,
  db,
  ADMIN_UID
} from "./firebase-config.js";

// ========================================
// HTML ELEMENTS
// ========================================

const $ = (id) => document.getElementById(id);

const loginPanel = $("login-panel");
const adminPanel = $("admin-panel");
const loginForm = $("login-form");
const productForm = $("product-form");
const productsContainer = $("admin-products");

let allProducts = [];
let stopWatching = null;

function showMessage(id, message) {
  $(id).textContent = message;
}

// ========================================
// ADMIN LOGIN
// ========================================

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = $("email").value.trim();
  const password = $("password").value;

  showMessage("login-message", "Signing in...");

  try {
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    $("password").value = "";
    showMessage("login-message", "");

  } catch (error) {
    showMessage(
      "login-message",
      "Sign in failed. Check your email and password."
    );
  }
});

// ========================================
// LOGOUT
// ========================================

$("logout").addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (error) {
    showMessage(
      "save-message",
      "Sign out failed: " + error.message
    );
  }
});

// ========================================
// CHECK ADMIN AUTHORIZATION
// ========================================

onAuthStateChanged(auth, async (user) => {

  const isAdmin =
    user !== null &&
    user.uid === ADMIN_UID;

  loginPanel.hidden = isAdmin;
  adminPanel.hidden = !isAdmin;

  if (stopWatching) {
    stopWatching();
    stopWatching = null;
  }

  if (user && !isAdmin) {
    showMessage(
      "login-message",
      "This account is not authorized as an admin."
    );

    await signOut(auth);
    return;
  }

  if (isAdmin) {
    stopWatching = onSnapshot(
      collection(db, "products"),

      (snapshot) => {
        allProducts = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data()
        }));

        renderProducts();
      },

      (error) => {
        showMessage(
          "save-message",
          "Cannot load products: " + error.message
        );
      }
    );
  }
});

// ========================================
// RESET PRODUCT FORM
// ========================================

function resetProductForm() {
  productForm.reset();

  $("product-id").value = "";
  $("published").checked = true;
  $("save-product").textContent = "Save Product";
}

$("cancel-edit").addEventListener(
  "click",
  resetProductForm
);

// ========================================
// DISPLAY EXISTING PRODUCTS
// ========================================

function renderProducts() {

  productsContainer.replaceChildren();

  if (allProducts.length === 0) {
    const message = document.createElement("p");

    message.textContent =
      "No products yet. Add your first product.";

    productsContainer.appendChild(message);
    return;
  }

  allProducts.forEach((product) => {

    const row = document.createElement("div");
    row.className = "product-row";

    const image = document.createElement("img");
    image.src = product.images?.[0] || "";
    image.alt = product.name || "Product";

    const info = document.createElement("div");
    info.className = "info";

    const title = document.createElement("strong");
    title.textContent = product.name;

    const details = document.createElement("p");

    details.textContent =
      "$" + Number(product.price).toFixed(2) +
      " • " + product.category +
      " • " +
      (product.published ? "Published" : "Draft");

    info.append(title, details);

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";

    editButton.addEventListener("click", () => {
      editProduct(product);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-button";

    deleteButton.addEventListener("click", () => {
      deleteProduct(product);
    });

    row.append(
      image,
      info,
      editButton,
      deleteButton
    );

    productsContainer.appendChild(row);
  });
}

// ========================================
// EDIT PRODUCT
// ========================================

function editProduct(product) {

  $("product-id").value = product.id;

  $("name").value = product.name;
  $("price").value = product.price;
  $("category").value = product.category;

  $("description").value =
    product.description || "";

  $("published").checked =
    Boolean(product.published);

  // Display current image URLs.
  $("image-urls").value =
    (product.images || []).join("\n");

  $("save-product").textContent = "Update Product";

  productForm.scrollIntoView({
    behavior: "smooth"
  });
}

// ========================================
// DELETE PRODUCT
// ========================================

async function deleteProduct(product) {

  const confirmed = confirm(
    "Delete " + product.name + "? This cannot be undone."
  );

  if (!confirmed) return;

  try {
    await deleteDoc(
      doc(db, "products", product.id)
    );

    if ($("product-id").value === product.id) {
      resetProductForm();
    }

    showMessage(
      "save-message",
      "Product deleted successfully."
    );

  } catch (error) {
    showMessage(
      "save-message",
      "Delete failed: " + error.message
    );
  }
}

// ========================================
// IMAGE URL VALIDATION
// ========================================

function getImageURLs() {

  const lines = $("image-urls")
    .value.split("\n")
    .map((url) => url.trim())
    .filter(Boolean);

  if (lines.length === 0 || lines.length > 6) {
    throw new Error(
      "Enter between 1 and 6 image URLs."
    );
  }

  const allowedHosts = [
    "bouchra278.github.io",
    "raw.githubusercontent.com"
  ];

  for (const imageURL of lines) {

    let parsed;

    try {
      parsed = new URL(imageURL);
    } catch (error) {
      throw new Error("Invalid image URL: " + imageURL);
    }

    if (
      parsed.protocol !== "https:" ||
      !allowedHosts.includes(parsed.hostname)
    ) {
      throw new Error(
        "Use an HTTPS image URL from your GitHub website."
      );
    }

    if (
      !/\.(jpg|jpeg|png|webp)$/i.test(parsed.pathname)
    ) {
      throw new Error(
        "Image URL must end in JPG, JPEG, PNG or WebP."
      );
    }
  }

  return lines;
}

// ========================================
// ADD OR UPDATE PRODUCT
// ========================================

productForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  if (auth.currentUser?.uid !== ADMIN_UID) {
    showMessage(
      "save-message",
      "You are not authorized."
    );
    return;
  }

  const productId = $("product-id").value;

  const name = $("name").value.trim();
  const price = Number($("price").value);
  const category = $("category").value;
  const description = $("description").value.trim();
  const published = $("published").checked;

  const validCategories = [
    "candles",
    "gypsum",
    "gifts"
  ];

  if (
    !name ||
    name.length > 100 ||
    !Number.isFinite(price) ||
    price < 0 ||
    price > 100000 ||
    !validCategories.includes(category) ||
    description.length > 2000
  ) {
    showMessage(
      "save-message",
      "Please enter valid product details."
    );
    return;
  }

  let images;

  try {
    images = getImageURLs();
  } catch (error) {
    showMessage("save-message", error.message);
    return;
  }

  const oldProduct = allProducts.find(
    (product) => product.id === productId
  );

  if (productId && !oldProduct) {
    showMessage(
      "save-message",
      "Product not found. Refresh and try again."
    );
    return;
  }

  $("save-product").disabled = true;

  showMessage(
    "save-message",
    "Saving product..."
  );

  try {

    const productData = {
      name,
      price,
      category,
      description,
      published,
      images,
      updatedAt: serverTimestamp()
    };

    if (productId) {

      await updateDoc(
        doc(db, "products", productId),
        productData
      );

    } else {

      await addDoc(
        collection(db, "products"),
        {
          ...productData,
          createdAt: serverTimestamp()
        }
      );
    }

    resetProductForm();

    showMessage(
      "save-message",
      "Product saved successfully!"
    );

  } catch (error) {

    console.error("Firebase login error:", error.code, error);

  showMessage(
    "login-message",
    "Login error: " + (error.code || "Unknown error")
    );

  } finally {

    $("save-product").disabled = false;
  }
});
