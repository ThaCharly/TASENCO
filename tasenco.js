const products = [{
  id: 1,
  name: 'PHOENIX-5W',
  category: 'Combo',
  price: 2890,
  description: 'Combo de 5 watts con una sola válvula EL34. Sonido limpio y cristalino que se rompe con gracia al subir el volumen.',
  specs: ['1× EL34', 'Transformador Primus UK', 'Caja de pino americano', 'Reverb spring'],
  image: './images/TASENCObk.webp',
  featured: false
}, {
  id: 2,
  name: 'PHOENIX-50W',
  category: 'Combo',
  price: 4290,
  description: 'La versión potente del Phoenix. Cuatro válvulas EL34 que ofrecen desde cleans cálidos hasta crunch clásico.',
  specs: ['4× EL34', 'Transformador Primus UK', 'Caja de caoba', 'Reverb spring + tremolo'],
  image: './images/TASENCObk.webp',
  featured: true
}, {
  id: 3,
  name: 'ATLAS-HEAD',
  category: 'Head',
  price: 3650,
  description: 'Head de tres canales con preamplificación híbrida. ECC83 + 6L6.',
  specs: ['2× ECC83 + 2× 6L6', 'Transformador Primus UK', 'Caja de acero y madera', '3 canales independientes'],
  image: './images/TASENCObk.webp',
  featured: false
}, {
  id: 4,
  name: 'LUNA-MINI',
  category: 'Combo',
  price: 1950,
  description: 'Pequeño pero poderoso. Un solo EL84 que produce un sonido vintage inconfundible.',
  specs: ['1× EL84', 'Transformador Primus UK', 'Caja de pino', 'Puerto de altavoz 8"'],
  image: './images/TASENCObk.webp',
  featured: false
}, {
  id: 5,
  name: 'TITAN-STACK',
  category: 'Stack',
  price: 6490,
  description: 'Nuestro amplificador insignia. Cabecera y combo en caja de roble con 100W.',
  specs: ['8× EL34', 'Transformador Primus UK', 'Caja de roble americano', 'Cabina 2×12'],
  image: './images/TASENCObk.webp',
  featured: false
}, {
  id: 6,
  name: 'ECHO-PDL',
  category: 'Pedales',
  price: 490,
  description: 'Pedal de delay analógico con válvula ECC83. Hasta 12 segundos de eco.',
  specs: ['1× ECC83', 'Circuito totalmente analógico', 'Control de tempo, feedback y tone'],
  image: './images/TASENCObk.webp',
  featured: false
}];

let cart = JSON.parse(localStorage.getItem('TASENCO-cart') || '[]');
let discountPercent = 0;
let activeFilter = 'Todos';
let searchQuery = '';
const categories = ['Todos', ...new Set(products.map(p => p.category))];

function renderFilters() {
  document.getElementById('filterBar').innerHTML = categories.map(cat =>
    `<button class="filter-btn ${cat === activeFilter ? 'active' : ''}" onclick="setFilter('${cat}')">${cat}</button>`
  ).join('');
}

function renderProducts(filter) {
  let filtered = filter === 'Todos' ? products : products.filter(p => p.category === filter);
  if (searchQuery.trim()) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  document.getElementById('productGrid').innerHTML = filtered.map((p, i) => `
    <div class="product-card animate-in ${p.featured ? 'featured' : ''}" style="animation-delay: ${i * 0.05}s" onclick="openModal(${p.id})">
      <div class="product-img-wrapper">
        <div class="otk-badge">handmade</div>
        <div class="serial-stamp">NO. 000${p.id}7</div>
        <img class="product-img" src="${p.image}" alt="${p.name}" loading="lazy" />
      </div>
      <div class="product-body">
        <span class="product-category">${p.category}</span>
        <h3 class="product-name">${p.name}</h3>
        <p class="product-desc">${p.description}</p>
        <table class="spec-mini">
          ${p.specs.map(s => {
            const parts = s.split(' ');
            const label = parts[0];
            const value = parts.slice(1).join(' ');
            return `<tr><td>${label}</td><td>${value}</td></tr>`;
          }).join('')}
        </table>
        <div class="product-footer">
          <span class="product-price">USD ${p.price.toLocaleString()}</span>
          <button class="add-btn" onclick="event.stopPropagation(); addToCart(${p.id})">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

function setFilter(cat) { activeFilter = cat; renderFilters(); renderProducts(cat); }

function openModal(id) {
  const p = products.find(x => x.id === id);
  document.getElementById('modalImg').src = p.image;
  document.getElementById('modalImg').alt = p.name;
  document.getElementById('modalBody').innerHTML = `
    <span class="product-category">${p.category}</span>
    <h2 style="font-family: var(--font-techno); font-size: 2rem; margin-bottom: 0.3em; text-transform: uppercase;">${p.name}</h2>
    <p style="color: var(--muted); line-height: 1.75; margin-bottom: 1.5rem; font-style: italic;">${p.description}</p>
    <table class="spec-table">
      ${p.specs.map(s => {
        const parts = s.split(' ');
        const label = parts[0];
        const value = parts.slice(1).join(' ');
        return `<tr><td>${label}</td><td>${value}</td></tr>`;
      }).join('')}
    </table>
    <p style="font-family: var(--font-mono); font-size: 2rem; color: var(--ink); margin-bottom: 1.5rem; font-weight: 700;">USD ${p.price.toLocaleString()}</p>
    <button class="btn-primary" onclick="addToCart(${p.id}); closeModal();">Añadir al carrito</button>
  `;
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('modalOverlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });

function saveCart() {
  localStorage.setItem('TASENCO-cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cartCount').textContent = totalItems;
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const existing = cart.find(item => item.product.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ product, quantity: 1 });
  }
  saveCart();
  showToast(`${product.name} añadido al carrito`);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.product.id !== productId);
  saveCart();
  renderCart();
}

function changeQuantity(productId, delta) {
  const item = cart.find(i => i.product.id === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.product.id !== productId);
  }
  saveCart();
  renderCart();
}

function getCartSubtotal() {
  return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

function getShippingCost() {
  const subtotal = getCartSubtotal();
  const shippingRadio = document.querySelector('input[name="shipping"]:checked');
  if (!shippingRadio) return 15;
  let cost = parseFloat(shippingRadio.value);
  if (cost === 15 && subtotal > 3000) {
    cost = 0;
  }
  return cost;
}

function updateCartSummary() {
  const subtotal = getCartSubtotal();
  const discountAmount = subtotal * discountPercent;
  const shipping = getShippingCost();
  const total = subtotal - discountAmount + shipping;

  document.getElementById('subtotalDisplay').textContent = `USD ${subtotal.toLocaleString()}`;
  if (discountPercent > 0) {
    document.getElementById('discountRow').style.display = 'flex';
    document.getElementById('discountDisplay').textContent = `-USD ${discountAmount.toLocaleString()}`;
  } else {
    document.getElementById('discountRow').style.display = 'none';
  }
  document.getElementById('shippingDisplay').textContent = `USD ${shipping.toLocaleString()}`;
  document.getElementById('totalDisplay').textContent = `USD ${total.toLocaleString()}`;
}

function renderCart() {
  const container = document.getElementById('cartItemsContainer');
  const summary = document.getElementById('cartSummary');
  if (cart.length === 0) {
    container.innerHTML = `<div class="cart-empty">Tu carrito está vacío.</div>`;
    summary.style.display = 'none';
    document.getElementById('promoMessage').textContent = '';
    discountPercent = 0;
    return;
  }
  summary.style.display = 'block';
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.product.image}" alt="${item.product.name}" />
      <div class="cart-item-info">
        <h3>${item.product.name}</h3>
        <p>USD ${item.product.price.toLocaleString()} c/u</p>
        <div class="cart-item-quantity">
          <button class="qty-btn" onclick="changeQuantity(${item.product.id}, -1)">−</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" onclick="changeQuantity(${item.product.id}, 1)">+</button>
        </div>
      </div>
      <span class="cart-item-total">USD ${(item.product.price * item.quantity).toLocaleString()}</span>
      <button class="cart-item-remove" onclick="removeFromCart(${item.product.id})">Quitar</button>
    </div>
  `).join('');
  updateCartSummary();
}

function openCart() {
  renderCart();
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('cartOverlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeCart(); });

function applyPromo() {
  const code = document.getElementById('promoCode').value.trim().toUpperCase();
  const messageEl = document.getElementById('promoMessage');
  if (code === 'TUBE10') {
    discountPercent = 0.1;
    messageEl.textContent = 'Código aplicado: 10% de descuento';
  } else {
    discountPercent = 0;
    messageEl.textContent = 'Código inválido';
  }
  updateCartSummary();
}

function checkout() {
  const email = document.getElementById('cartEmail').value.trim();
  if (!email || !email.includes('@')) {
    showToast('Por favor, introduce un email válido.');
    return;
  }
  showToast('¡Pedido realizado con éxito! Te enviaremos la confirmación a ' + email);
  cart = [];
  discountPercent = 0;
  saveCart();
  closeCart();
  renderCart();
}

function toggleCart() {
  openCart();
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.getElementById('toastContainer').appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); }, 3000);
  setTimeout(() => t.remove(), 3400);
}

async function handleContact(e) {
  e.preventDefault();
  
  const form = e.target;
  const btn = document.getElementById('submitBtn');
  const originalText = btn.textContent;
  
  // ACÁ: Cambiá esto por el link que te tira Formspree
  const FORMSPREE_URL = "https://formspree.io/f/TU_CODIGO_ACA"; 
  
  btn.textContent = "ENVIANDO...";
  btn.disabled = true;

  try {
    const response = await fetch(FORMSPREE_URL, {
      method: 'POST',
      body: new FormData(form),
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      showToast('¡Mensaje enviado! Nos contactaremos a la brevedad.');
      form.reset();
    } else {
      showToast('Error de servidor. Intentá de nuevo.');
    }
  } catch (error) {
    showToast('Error de red. Revisá tu conexión a internet.');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

updateCartCount();
renderFilters();
renderProducts('Todos');

document.getElementById('searchInput').addEventListener('input', e => {
  searchQuery = e.target.value;
  renderProducts(activeFilter);
});

window.addEventListener('scroll', () => {
  document.querySelector('.nav').classList.toggle('scrolled', window.scrollY > 20);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closeCart();
  }
});
