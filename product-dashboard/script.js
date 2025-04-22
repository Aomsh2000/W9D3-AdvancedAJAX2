document.getElementById('loadProductsButton').addEventListener('click', loadProducts);
document.getElementById('addProductBtn').addEventListener('click', addProduct);
document.getElementById('searchInput').addEventListener('input', handleSearchInput);
document.getElementById('loadMoreBtn').addEventListener('click', () => {
  currentPage++;
  renderProductsPage();
});

// Pagination data
let currentPage = 1;
const itemsPerPage = 10;
let allData = [];

// Load products using GET
async function loadProducts() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts');
    allData = await res.json();

    currentPage = 1;
    document.getElementById('productList').innerHTML = '';
    renderProductsPage();
  } catch (error) {
    alert("❌ Failed to load products");
    console.error(error);
  }
}

function renderProductsPage() {
  const productList = document.getElementById('productList');
  const start = (currentPage - 1) * itemsPerPage;
  const end = currentPage * itemsPerPage;
  const pageData = allData.slice(start, end);

  pageData.forEach(product => {
    const productElement = createProductElement(product);
    productList.appendChild(productElement);
  });
}

// Add product using POST
async function addProduct() {
  const title = document.getElementById('productTitle').value;
  const body = document.getElementById('productBody').value;

  if (!title || !body) return alert("🚫 Please fill all fields.");

  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      body: JSON.stringify({ title, body, userId: 1 }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });

    const newProduct = await res.json();
    alert("✅ Product added!");

    const productList = document.getElementById('productList');
    const productElement = createProductElement(newProduct);
    productList.prepend(productElement);

    document.getElementById('productTitle').value = '';
    document.getElementById('productBody').value = '';
  } catch (error) {
    alert("❌ Error adding product");
    console.error(error);
  }
}

// Create product element with buttons
function createProductElement(product) {
  const div = document.createElement('div');
  div.className = 'product';
  div.setAttribute('data-id', product.id);

  div.innerHTML = `
    <h3>${product.title}</h3>
    <p>${product.body}</p>
    <button class="editBtn">✏️ Edit</button>
    <button class="deleteBtn">🗑️ Delete</button>
  `;

  div.querySelector('.editBtn').addEventListener('click', () => editProduct(product));
  div.querySelector('.deleteBtn').addEventListener('click', () => deleteProduct(product.id));

  return div;
}

// Edit product using PUT
async function editProduct(product) {
  const newTitle = prompt("Enter new title:", product.title);
  const newBody = prompt("Enter new body:", product.body);

  if (!newTitle || !newBody) return;

  try {
    const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${product.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        id: product.id,
        title: newTitle,
        body: newBody,
        userId: product.userId,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });

    const updated = await res.json();
    alert("✅ Product updated!");

    const updatedDiv = createProductElement(updated);
    const oldDiv = document.querySelector(`[data-id='${product.id}']`);
    oldDiv.replaceWith(updatedDiv);
  } catch (err) {
    alert("❌ Failed to update product");
    console.error(err);
  }
}

// Delete product using DELETE
async function deleteProduct(productId) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    await fetch(`https://jsonplaceholder.typicode.com/posts/${productId}`, {
      method: 'DELETE',
    });

    document.querySelector(`[data-id='${productId}']`).remove();
    alert("🗑️ Product deleted");
  } catch (err) {
    alert("❌ Failed to delete product");
    console.error(err);
  }
}

// Debounced Search
let debounceTimer;
function handleSearchInput() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
      searchProducts(query);
    } else {
      document.getElementById('productList').innerHTML = '';
      renderProductsPage();
    }
  }, 500);
}

async function searchProducts(query) {
  try {
    const res = await fetch(`https://jsonplaceholder.typicode.com/posts?q=${query}`);
    const data = await res.json();

    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    data.slice(0, 10).forEach(product => {
      const productElement = createProductElement(product);
      productList.appendChild(productElement);
    });
  } catch (error) {
    alert("❌ Search failed");
    console.error(error);
  }
}
