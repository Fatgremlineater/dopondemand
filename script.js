// ✅ Detect customer type (private/business)
const urlParams = new URLSearchParams(window.location.search);
const userType = urlParams.get('type') || 'private';
document.body.classList.add(`${userType}-mode`);

const banner = document.getElementById("customer-mode-banner");
banner.textContent = userType === "business"
  ? "🏢 You're browsing as a Business Customer"
  : "👤 You're browsing as a Private Customer";

// ✅ Toggle appropriate form
if (userType === 'business') {
  document.getElementById('private-fields').style.display = 'none';
  document.getElementById('business-fields').style.display = 'block';
} else {
  document.getElementById('private-fields').style.display = 'block';
  document.getElementById('business-fields').style.display = 'none';
}

// ✅ Show product categories
function showCategory(categoryId) {
  const categories = document.querySelectorAll('.product-grid');
  categories.forEach(cat => {
    cat.style.display = 'none';
  });

  const target = document.getElementById(categoryId);
  if (target) {
    target.style.display = 'flex';
  }
}

// ✅ Show first tab on load
window.addEventListener('DOMContentLoaded', () => {
  showCategory('beer');
});

// ✅ Cart object to store added items
const cart = {};

// ✅ Dynamically generate products from JSON
fetch('products.json')
  .then(res => res.json())
  .then(products => {
    console.log("📦 Loading products:", products);
    generateProducts(products);
    setupCartButtons(); // attach event listeners after cards are added
  })
  .catch(err => console.error("❌ Failed to load products.json:", err));

// ✅ Product card generator
function generateProducts(products) {
  const categories = [
    "beer", "brandy", "ciders", "gin", "liquers",
    "spirits", "tequila", "vodka", "whisky", "wines"
  ];

  categories.forEach(category => {
    const container = document.getElementById(category);
    if (!container) return;

    const filtered = products.filter(p =>
      p.category === category &&
      (p.type === userType || p.type === 'both')
    );

    filtered.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${product.image || 'images/placeholder.png'}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p class="price">R${product.price.toFixed(2)}</p>
        <input type="number" placeholder="Qty" min="0">
        <button>Add to Cart</button>
      `;
      container.appendChild(card);
    });
  });
}

// ✅ Attach event listeners after products are added
function setupCartButtons() {
  document.querySelectorAll('.product-card').forEach(card => {
    const button = card.querySelector('button');
    const input = card.querySelector('input');
    const title = card.querySelector('h3').textContent;

    button.addEventListener('click', () => {
      const qty = parseInt(input.value);
      if (qty > 0) {
        cart[title] = qty;
        button.textContent = '✓ Added';
        button.style.backgroundColor = '#28a745';
        setTimeout(() => {
          button.textContent = 'Add to Cart';
          button.style.backgroundColor = '#2c3e50';
        }, 3000);
      } else {
        alert("Please enter a valid quantity before adding to cart.");
      }
    });
  });
}

// ✅ Submit order and show invoice popup
document.querySelector('.submit-order')?.addEventListener('click', () => {
  const summaryBox = document.getElementById('summary-details');
  summaryBox.innerHTML = '';

  // Get customer info based on user type
  let name, phone, email, address;

  if (userType === 'business') {
    name = document.getElementById('bizname').value;
    phone = document.getElementById('phonebiz').value;
    email = document.getElementById('emailbiz').value;
    address = document.getElementById('addressbiz').value;
  } else {
    name = document.getElementById('fullname').value;
    phone = document.getElementById('phone').value;
    email = document.getElementById('email').value;
    address = document.getElementById('address').value;
  }

  let total = 0;
  let productRows = '';

  Object.entries(cart).forEach(([product, qty]) => {
    let price = 0;
    document.querySelectorAll('.product-card').forEach(card => {
      const title = card.querySelector('h3').textContent;
      if (title === product) {
        const priceText = card.querySelector('.price').textContent;
        price = parseFloat(priceText.replace(/[^\d.]/g, ''));
      }
    });

    const subtotal = qty * price;
    total += subtotal;

    productRows += `
      <tr>
        <td style="padding: 8px;">${product}</td>
        <td style="text-align: center; padding: 8px;">${qty}</td>
        <td style="text-align: right; padding: 8px;">R${subtotal.toFixed(2)}</td>
      </tr>
    `;
  });

  summaryBox.innerHTML = `
    <div style="padding: 1rem; border: 1px solid #ccc; background: #fff; border-radius: 8px; font-family: Arial, sans-serif;">
      <h2 style="margin-bottom: 1rem; font-size: 1.4rem;">🧾 Invoice Summary</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Address:</strong> ${address}</p>
      <hr style="margin: 1rem 0;">
      <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ccc;">Product</th>
            <th style="text-align: center; padding: 8px; border-bottom: 1px solid #ccc;">Qty</th>
            <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ccc;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
        </tbody>
      </table>
      <hr style="margin: 1rem 0;">
      <p style="text-align: right; font-weight: bold; font-size: 1.2rem;">Total: R${total.toFixed(2)}</p>
    </div>
  `;

  document.getElementById('order-summary').style.display = 'flex';
});

// ✅ Close popup
function closePopup() {
  document.getElementById('order-summary').style.display = 'none';
}

// ✅ Request a Callback form
const callbackForm = document.getElementById('callback-form');
const confirmation = document.getElementById('callback-confirmation');

if (callbackForm) {
  callbackForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('cb-name').value;
    const email = document.getElementById('cb-email').value;
    const phone = document.getElementById('cb-phone').value;

    console.log("📞 Callback Requested:", { name, email, phone });

    callbackForm.reset();
    confirmation.style.display = 'block';
  });
}
