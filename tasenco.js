// Arrancamos con el catálogo vacío. Ya no es 'const', es 'let' porque se va a llenar dinámicamente.
// Arrancamos con el catálogo vacío.
let products = []; 
let cart = JSON.parse(localStorage.getItem('TASENCO-cart') || '[]');
let discountPercent = 0;
let activeFilter = 'Todos';
let searchQuery = '';
let categories = ['Todos'];

// Catálogo de contingencia (Hardcodeado para testing)
const localFallbackProducts = [
  {
    "id": 1,
    "name": "PHOENIX-5W",
    "category": "Combo",
    "price": 2890,
    "description": "Combo de 5 watts con una sola válvula EL34. Sonido limpio y cristalino que se rompe con gracia al subir el volumen.",
    "specs": ["1× EL34", "Transformador Primus UK", "Caja de pino americano", "Reverb spring"],
    "image": "./images/TASENCObk.webp",
    "featured": false,
    "audio": [
      { "name": "Clean (Neck)", "url": "https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg" },
      { "name": "Crunch (Bridge)", "url": "https://actions.google.com/sounds/v1/weapons/retro_laser_gun_shoot.ogg" }
    ]
  },
  {
    "id": 2,
    "name": "PHOENIX-50W",
    "category": "Combo",
    "price": 4290,
    "description": "La versión potente del Phoenix. Cuatro válvulas EL34 que ofrecen desde cleans cálidos hasta crunch clásico.",
    "specs": ["4× EL34", "Transformador Primus UK", "Caja de caoba", "Reverb spring + tremolo"],
    "image": "./images/TASENCObk.webp",
    "featured": false,
    "audio": [
      { "name": "Clean Channel", "url": "https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg" },
      { "name": "Drive Channel", "url": "https://actions.google.com/sounds/v1/weapons/retro_laser_gun_shoot.ogg" }
    ]
  },
  {
    "id": 3,
    "name": "ATLAS-Cabezal",
    "category": "Cabezal",
    "price": 3650,
    "description": "Cabezal de tres canales con preamplificación híbrida. ECC83 + 6L6.",
    "specs": ["2× ECC83 + 2× 6L6", "Transformador Primus UK", "Caja de acero y madera", "3 canales independientes"],
    "image": "./images/TASENCObk.webp",
    "featured": false,
    "audio": []
  }, 
  {
    "id": 4,
    "name": "LUNA-MINI",
    "category": "Combo",
    "price": 1950,
    "description": "Pequeño pero poderoso. Un solo EL84 que produce un sonido vintage inconfundible.",
    "specs": ["1× EL84", "Transformador Primus UK", "Caja de pino", "Puerto de altavoz 8"],
    "image": "./images/TASENCObk.webp",
    "featured": false,
    "audio": [
      { "name": "Vintage Tone", "url": "https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg" }
    ]
  }, 
  {
    "id": 5,
    "name": "TITAN-Stack",
    "category": "Cabezal y caja",
    "price": 6490,
    "description": "Nuestro amplificador insignia. Cabecera y combo en caja de roble con 100W.",
    "specs": ["8× EL34", "Transformador Primus UK", "Caja de roble americano", "Cabina 2×12"],
    "image": "./images/TASENCObk.webp",
    "featured": false,
    "audio": []
  }, 
  {
    "id": 6,
    "name": "ECHO-PDL",
    "category": "Pedales",
    "price": 490,
    "description": "Pedal de delay analógico con válvula ECC83. Hasta 12 segundos de eco.",
    "specs": ["1× ECC83", "Circuito totalmente analógico", "Control de tempo, feedback y tone"],
    "image": "./images/TASENCObk.webp",
    "featured": false,
    "audio": [
      { "name": "Slapback Delay", "url": "https://actions.google.com/sounds/v1/weapons/retro_laser_gun_shoot.ogg" }
    ]
  }
];

// --- LÓGICA DE CONEXIÓN CON EL BACKEND C++ ---
async function bootCatalog() {
  try {
    // Le pegamos al endpoint que armaste con Crow
    const response = await fetch('http://192.168.1.26:8080/api/productos');
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    // Volcamos la memoria de C++ en nuestra variable de JS
    products = await response.json();
    
  } catch (error) {
    console.warn("[FALLO DE SISTEMA] No se pudo conectar al servidor C++:", error);
    console.warn("[CONTINGENCIA] Levantando catálogo local de pruebas...");
    
    // Activamos el modo supervivencia
    products = localFallbackProducts;
    
    // Un toast para que te enteres que no estás leyendo de la API
    setTimeout(() => {
      showToast("Modo Offline: Catálogo local cargado.");
    }, 500);
  }

  // Sin importar de dónde sacamos la info, armamos el frontend
  categories = ['Todos', ...new Set(products.map(p => p.category))];
  renderFilters();
  renderProducts('Todos');
}

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
        <div class="serial-stamp">NO. 000${p.id}</div>
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

// --- LÓGICA DEL REPRODUCTOR DE AUDIO GLOBAL ---
const audioPlayer = new Audio();
let isPlaying = false;

// Evento que actualiza la barra y el tiempo milisegundo a milisegundo
audioPlayer.addEventListener('timeupdate', () => {
  const fill = document.getElementById('progressFill');
  const timeDisp = document.getElementById('timeDisplay');
  if (fill && timeDisp && audioPlayer.duration) {
    const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    fill.style.width = percent + '%';
    timeDisp.textContent = formatTime(audioPlayer.currentTime) + ' / ' + formatTime(audioPlayer.duration);
  }
});

// Cuando termina la pista, volvemos al estado inicial
audioPlayer.addEventListener('ended', () => {
  isPlaying = false;
  const btn = document.getElementById('playBtn');
  if(btn) btn.textContent = '▶';
});

// Formateador matemático para que los segundos se vean como reloj
function formatTime(seconds) {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}

// Función que dispara los tracks cuando tocan los botones
function loadTrack(url, btnNode) {
  // Deshabilitamos temporalmente para dar feedback de carga
  const allBtns = document.querySelectorAll('.track-btn');
  allBtns.forEach(b => {
    b.classList.remove('active');
    b.disabled = true;
    b.style.opacity = '0.5';
  });
  
  if (btnNode) {
    btnNode.classList.add('active');
    // Mini feedback técnico mientras carga
    const oldText = btnNode.textContent;
    btnNode.textContent = '[...] ' + oldText;
    
    isPlaying = false; // Forzamos apagado para no arrastrar fantasmas
    audioPlayer.src = url;
    audioPlayer.load();
    
    // Autoplay directo al hacer clic (lo que la gente espera)
    audioPlayer.play().then(() => {
      isPlaying = true;
      const playBtn = document.getElementById('playBtn');
      if (playBtn) playBtn.textContent = '❚❚';
    }).catch(e => {
      console.log('Esperando interacción...', e);
    }).finally(() => {
      // Restauramos los botones al arrancar
      allBtns.forEach(b => {
        b.disabled = false;
        b.style.opacity = '1';
      });
      btnNode.textContent = oldText;
    });
  }
}

// Control maestro de Play/Pause
function togglePlay() {
  const btn = document.getElementById('playBtn');
  if (!audioPlayer.src || audioPlayer.src.endsWith('undefined')) return; 

  if (isPlaying) {
    audioPlayer.pause();
    isPlaying = false;
    btn.textContent = '▶';
  } else {
    audioPlayer.play().then(() => {
      isPlaying = true;
      btn.textContent = '❚❚';
    }).catch(err => {
      showToast("Error al reproducir. Quizás el archivo dummy no existe.");
    });
  }
}

// Permite cliquear en la barra para adelantar el riff
function seekAudio(e) {
  if (!audioPlayer.duration) return;
  const wrapper = document.getElementById('progressWrapper');
  const rect = wrapper.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const percent = clickX / rect.width;
  audioPlayer.currentTime = percent * audioPlayer.duration;
}
// ----------------------------------------------

function openModal(id) {
  const p = products.find(x => x.id === id);
  document.getElementById('modalImg').src = p.image;
  document.getElementById('modalImg').alt = p.name;
  
  // Paramos cualquier audio que haya quedado colgado del producto anterior y reseteamos
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  isPlaying = false;
  
  const fakeFill = document.getElementById('progressFill');
  if (fakeFill) fakeFill.style.width = '0%';
  const timeDisp = document.getElementById('timeDisplay');
  if (timeDisp) timeDisp.textContent = '0:00 / 0:00';

  // Armamos la sección de audios con estética de diagnóstico
  let audioHTML = '';
  if (p.audio && p.audio.length > 0) {
    audioHTML = `
      <div class="audio-section">
        <div class="section-label">PRUEBAS DE DIAGNÓSTICO <span>[HZ/WAV]</span></div>
        <div class="track-list" id="trackList">
          ${p.audio.map((trk, i) => `<button class="track-btn ${i===0?'active':''}" onclick="loadTrack('${trk.url}', this)">${trk.name}</button>`).join('')}
        </div>
        <div class="audio-controls-custom">
          <button class="play-btn-custom" id="playBtn" onclick="togglePlay()">▶</button>
          <div class="progress-wrapper" id="progressWrapper" onclick="seekAudio(event)">
            <div class="progress-fill" id="progressFill"></div>
          </div>
          <div class="time-display" id="timeDisplay">0:00 / 0:00</div>
        </div>
      </div>
    `;
  }

  // Inyectamos el Plano completo en el Body
  document.getElementById('modalBody').innerHTML = `
    <div class="cajetin">
      <div class="c-cell c-title">PLANO // ${p.name}</div>
      <div class="c-cell">REV: A</div>
      <div class="c-cell" style="color: var(--muted);">${p.category}</div>
    </div>

    <div class="blueprint-content">
      <div class="notes-section">
        <div class="section-label">NOTAS DE INGENIERÍA <span>[REF. 01]</span></div>
        <p>${p.description}</p>
      </div>

      <div class="specs-section">
        <div class="section-label">L.D.M. (LISTA DE MATERIALES) <span>[BOM]</span></div>
        <table class="spec-table">
          ${p.specs.map(s => {
            const parts = s.split(' ');
            const label = parts[0];
            const value = parts.slice(1).join(' ');
            return `<tr><td>${label}</td><td>${value}</td></tr>`;
          }).join('')}
        </table>
      </div>

      ${audioHTML}
    </div>

    <div class="modal-footer-tech">
      <div class="price-tech">USD ${p.price.toLocaleString()}</div>
      <button class="btn-approve" onclick="addToCart(${p.id}); closeModal();">APROBAR ORDEN →</button>
    </div>
  `;
  
  if (p.audio && p.audio.length > 0) {
    audioPlayer.src = p.audio[0].url;
    audioPlayer.load();
    isPlaying = false;
  }

  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  
  // Matar el audio cuando cierran la ficha técnica (FUNDAMENTAL)
  audioPlayer.pause();
  isPlaying = false;
  const btn = document.getElementById('playBtn');
  if(btn) btn.textContent = '▶';
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
  
  const countSpan = document.getElementById('cartCount');
  if (countSpan) {
    countSpan.style.transform = 'scale(1.4)';
    setTimeout(() => { countSpan.style.transform = ''; }, 200);
  }
  
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
  
  if (shipping === 0 && subtotal > 3000) {
    document.getElementById('shippingDisplay').innerHTML = `<span style="color:var(--rust-bright); font-weight:700;">¡GRATIS!</span>`;
  } else {
    document.getElementById('shippingDisplay').textContent = `USD ${shipping.toLocaleString()}`;
  }
  
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
  } else if (code === 'TUBE50') {
    discountPercent = 0.5;
    messageEl.textContent = 'Código aplicado: 50% de descuento';
   }
  else {
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
  setTimeout(() => { t.classList.remove('show'); }, 4000);
  setTimeout(() => t.remove(), 4400);
}

async function handleContact(e) {
  e.preventDefault();
  
  const form = e.target;
  const btn = document.getElementById('submitBtn');
  const originalText = btn.textContent;
  
  const FORMSPREE_URL = "https://formspree.io/f/mjglpwqg"; 
  
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
      const data = await response.json();
      console.error("Error de Formspree:", data);
      
      if (Object.hasOwn(data, 'errors')) {
        const formspreeErrors = data.errors.map(err => err.message).join(", ");
        showToast('Error: ' + formspreeErrors);
      } else {
        showToast('Error de servidor. Fijate en la consola.');
      }
    }
  } catch (error) {
    console.error("Error de red:", error);
    showToast('Error de red. Revisá tu conexión a internet.');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

// Arrancamos el contador del carrito (que lee del LocalStorage, no precisa internet)
updateCartCount();

// Disparamos la secuencia de booteo asíncrona
bootCatalog();

document.getElementById('searchInput').addEventListener('input', e => {
  searchQuery = e.target.value;
  renderProducts(activeFilter);
});

window.addEventListener('scroll', () => {
  // Cambio de fondo del nav al bajar
  document.querySelector('.nav').classList.toggle('scrolled', window.scrollY > 20);

  // Lógica del Scrollspy: iluminar el nav según la sección
  let current = '';
  const sections = document.querySelectorAll('section[id]');
  // Calculamos el desfase leyendo directamente la regla del CSS
  const scrollPadding = parseInt(getComputedStyle(document.documentElement).scrollPaddingTop, 10) || 91;
  const offset = scrollPadding + 10; // +10px de margen de seguridad

  sections.forEach(section => {
    const sectionTop = section.offsetTop - offset;
    // Si la pantalla bajó más allá del inicio de esta sección, guardamos su ID
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  // Limpiamos todos los links y prendemos solo el que coincide con la sección actual
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === `#${current}`) {
      a.classList.add('active');
    }
  });
});

// Corremos el evento una vez al cargar por si la persona refresca la página a la mitad
window.dispatchEvent(new Event('scroll'));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closeCart();
  }
});
