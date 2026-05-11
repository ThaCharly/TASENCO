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
    "name": "TestAmp5W",
    "category": "Combo",
    "price": 999,
    "description": "Combo de 5 watts con una sola válvula EL34. Sonido limpio y cristalino que se rompe con gracia al subir el volumen.",
    "specs": ["1× EL34", "Caja de pino americano", "Reverb spring"],
    "image": ["./images/TASENCObk.webp", "./images/TASENCO.png", "./images/TASENCO.webp"],
    "featured": false,
    "audio": [
      { "name": "Clean (Neck)", "url": "https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg" },
      { "name": "Crunch (Bridge)", "url": "https://actions.google.com/sounds/v1/weapons/retro_laser_gun_shoot.ogg" }
    ]
  },
  {
    "id": 2,
    "name": "TestAmp50W",
    "category": "Combo",
    "price": 1999,
    "description": "La versión potente del Phoenix. Cuatro válvulas EL34 que ofrecen desde cleans cálidos hasta crunch clásico.",
    "specs": ["4× EL34", "Caja de caoba", "Reverb spring + tremolo"],
    "image": ["./images/TASENCObk.webp", "./images/TASENCO.png", "./images/TASENCO.webp"],
    "featured": false,
    "audio": [
      { "name": "Clean Channel", "url": "https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg" },
      { "name": "Drive Channel", "url": "https://actions.google.com/sounds/v1/weapons/retro_laser_gun_shoot.ogg" }
    ]
  },
  {
    "id": 3,
    "name": "TestAmp15W",
    "category": "Cabezal",
    "price": 1499,
    "description": "Cabezal de tres canales con preamplificación híbrida. ECC83 + 6L6.",
    "specs": ["2× ECC83 + 2× 6L6", "Caja de acero y madera", "3 canales independientes"],
    "image": ["./images/TASENCObk.webp", "./images/TASENCO.png", "./images/TASENCO.webp"],
    "featured": false,
    "audio": []
  },
  {
    "id": 4,
    "name": "TestAmp3W",
    "category": "Combo",
    "price": 799,
    "description": "Pequeño pero poderoso. Un solo EL84 que produce un sonido vintage inconfundible.",
    "specs": ["1× EL84", "Caja de pino", "Puerto de altavoz 8"],
    "image": ["./images/TASENCObk.webp", "./images/TASENCO.png", "./images/TASENCO.webp"],
    "featured": false,
    "audio": [
      { "name": "Vintage Tone", "url": "https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg" }
    ]
  },
  {
    "id": 5,
    "name": "TestAmp100W",
    "category": "Cabezal y caja",
    "price": 2999,
    "description": "Nuestro amplificador insignia. Cabecera y combo en caja de roble con 100W.",
    "specs": ["8× EL34", "Caja de roble americano", "Cabina 2×12"],
    "image": ["./images/TASENCObk.webp", "./images/TASENCO.png", "./images/TASENCO.webp"],
    "featured": false,
    "audio": []
  },
  {
    "id": 6,
    "name": "TestPedal",
    "category": "Pedales",
    "price": 299,
    "description": "Pedal de delay analógico con válvula ECC83. Hasta 12 segundos de eco.",
    "specs": ["1× ECC83", "Circuito totalmente analógico", "Control de tempo, feedback y tone"],
    "image": ["./images/TASENCObk.webp", "./images/TASENCO.png", "./images/TASENCO.webp"],
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
  
  // Limpiamos la clase 'animate-in' vieja del HTML
  document.getElementById('productGrid').innerHTML = filtered.map((p, i) => `
    <div class="product-card ${p.featured ? 'featured' : ''}" onclick="openModal(${p.id})" onmouseenter="startCardHover(${p.id})" onmouseleave="stopCardHover(${p.id})">
      <div class="product-img-wrapper">
        <div class="otk-badge">handmade</div>
        <div class="serial-stamp">NO. 000${p.id}</div>
        <img class="product-img" id="card-img-${p.id}" src="${Array.isArray(p.images) ? p.images[0] : (Array.isArray(p.image) ? p.image[0] : (p.image || './images/TASENCObk.webp'))}" alt="${p.name}" loading="lazy" />
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

  // Magia QoL: Intersection Observer
  const cards = document.querySelectorAll('.product-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Le damos un pequeño retraso en cascada (0ms, 100ms, 200ms...)
        // basado en su posición en la grilla para que se vea escalonado
        const delay = Array.from(cards).indexOf(entry.target) % 3 * 100;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        // Una vez que apareció, dejamos de observarlo para no gastar CPU
        observer.unobserve(entry.target); 
      }
    });
  }, { threshold: 0.1 }); // El 10% del producto tiene que estar visible para que salte

  cards.forEach(card => observer.observe(card));
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
// Control maestro de Play/Pause
function togglePlay() {
  const btn = document.getElementById('playBtn');
  if (!audioPlayer.src || audioPlayer.src.endsWith('undefined')) return; 

  if (isPlaying) {
    audioPlayer.pause();
    isPlaying = false;
    btn.textContent = '▶';
    btn.classList.remove('playing'); // Apagamos el brillo
  } else {
    audioPlayer.play().then(() => {
      isPlaying = true;
      btn.textContent = '❚❚';
      btn.classList.add('playing'); // Prendemos la válvula
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

// --- LÓGICA DE CARRUSEL EN PRODUCT CARDS ---
const hoverTimers = {};
const hoverIndexes = {};

window.startCardHover = function(id) {
  const p = products.find(x => x.id === id);
  let imgArray = [];
  if (Array.isArray(p.images) && p.images.length > 0) imgArray = p.images;
  else if (Array.isArray(p.image) && p.image.length > 0) imgArray = p.image;
  
  if (imgArray.length <= 1) return; // Si hay 1 sola foto, ni nos gastamos

  const imgEl = document.getElementById(`card-img-${id}`);
  hoverIndexes[id] = 0;

  // Cambiamos de foto cada 1.2 segundos (1200ms)
  hoverTimers[id] = setInterval(() => {
    hoverIndexes[id] = (hoverIndexes[id] + 1) % imgArray.length;
    
    // Efecto de parpadeo suave al cambiar
    imgEl.style.opacity = '0.7'; 
    setTimeout(() => {
      imgEl.src = imgArray[hoverIndexes[id]];
      imgEl.style.opacity = '1';
    }, 150);
  }, 1200);
}

window.stopCardHover = function(id) {
  if (hoverTimers[id]) {
    clearInterval(hoverTimers[id]);
    delete hoverTimers[id];
    
    // Restauramos la foto original al sacar el mouse
    const p = products.find(x => x.id === id);
    let imgArray = [];
    if (Array.isArray(p.images) && p.images.length > 0) imgArray = p.images;
    else if (Array.isArray(p.image) && p.image.length > 0) imgArray = p.image;
    
    const imgEl = document.getElementById(`card-img-${id}`);
    if (imgEl && imgArray.length > 0) {
      imgEl.src = imgArray[0];
      imgEl.style.opacity = '1';
    }
  }
}

function openModal(id) {
  const p = products.find(x => x.id === id);
  
  // Lógica a prueba de balas: agarramos el array de 'images', o de 'image' si le erraste al nombre en la BD, o armamos un array con el string suelto
  let imgArray = [];
  if (Array.isArray(p.images) && p.images.length > 0) imgArray = p.images;
  else if (Array.isArray(p.image) && p.image.length > 0) imgArray = p.image;
  else imgArray = [p.image || './images/TASENCObk.webp'];
  
  // Construimos el collage vertical (fotos apiladas tipo mesa de taller)
  let galleryHTML = `<div class="modal-collage">`;
  
  // Si nos mandaste 20 fotos, agarramos solo las primeras 3 para el collage
  const collageImages = imgArray.slice(0, 3);
  
  collageImages.forEach((src, index) => {
    // Agregamos el evento onclick llamando a la nueva función de Lightbox
    galleryHTML += `<img class="collage-img collage-img-${index}" src="${src}" alt="${p.name} - Vista ${index + 1}" onclick="openLightbox('${src}')" />`;
  });
  
  galleryHTML += `</div>`;
  
  document.getElementById('modalGalleryContainer').innerHTML = galleryHTML;
  
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

// --- LÓGICA DEL LIGHTBOX (Modo Inspección Visual) ---
function openLightbox(src) {
  let lb = document.getElementById('lightboxOverlay');
  if (!lb) {
    // Creamos el nodo dinámicamente la primera vez que se usa para no ensuciar el HTML
    lb = document.createElement('div');
    lb.id = 'lightboxOverlay';
    lb.className = 'lightbox-overlay';
    lb.innerHTML = `
      <div class="lightbox-close" onclick="closeLightbox()">×</div>
      <img class="lightbox-img" id="lightboxImg" src="" alt="Vista en detalle" />
    `;
    document.body.appendChild(lb);
    // Cerrar si se hace click en el fondo oscuro
    lb.addEventListener('click', e => { if(e.target === lb) closeLightbox(); });
  }
  
  const imgEl = document.getElementById('lightboxImg');
  imgEl.src = src;
  
  // Forzamos un reflow para que la animación salte limpia desde cero
  void lb.offsetWidth;
  lb.classList.add('open');
}

function closeLightbox() {
  const lb = document.getElementById('lightboxOverlay');
  if (lb) lb.classList.remove('open');
}
// ----------------------------------------------------

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
  if (cost === 15 && subtotal > 1500) {
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
  
  if (shipping === 0 && subtotal > 1500) {
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
      <img class="cart-item-img" src="${Array.isArray(item.product.images) ? item.product.images[0] : (Array.isArray(item.product.image) ? item.product.image[0] : (item.product.image || './images/TASENCObk.webp'))}" alt="${item.product.name}" />
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
  
  // Temporizadores originales
  let hideTimeout = setTimeout(() => { t.classList.remove('show'); }, 4000);
  let removeTimeout = setTimeout(() => t.remove(), 4400);

  // --- LÓGICA DE SWIPE (Deslizar para descartar) ---
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  t.addEventListener('pointerdown', (e) => {
    isDragging = true;
    startX = e.clientX;
    t.style.transition = 'none'; // Desactivar la transición para que siga al dedo instantáneamente
    clearTimeout(hideTimeout);   // Pausar el auto-ocultado mientras lo tenés agarrado
    clearTimeout(removeTimeout);
    t.setPointerCapture(e.pointerId);
  });

  t.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    currentX = e.clientX - startX;
    // Permitimos deslizar en ambas direcciones
    t.style.transform = `translateX(${currentX}px)`;
    t.style.opacity = 1 - (Math.abs(currentX) / 250); 
  });

  t.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    t.style.transition = 'transform 0.3s, opacity 0.3s'; // Reactivar transición
    t.releasePointerCapture(e.pointerId);

    if (Math.abs(currentX) > 60) {
      // Si lo deslizó más de 60px de recorrido, lo matamos
      const direction = currentX > 0 ? '120%' : '-120%';
      t.style.transform = `translateX(${direction})`;
      t.style.opacity = 0;
      setTimeout(() => t.remove(), 300);
    } else {
      // Si fue un toque sin querer, el resorte lo vuelve a su lugar y reinicia el timer
      t.style.transform = '';
      t.style.opacity = '';
      hideTimeout = setTimeout(() => { t.classList.remove('show'); }, 4000);
      removeTimeout = setTimeout(() => t.remove(), 4400);
    }
  });
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

let lastScrollY = window.scrollY; // Variable para trackear hacia dónde vamos

window.addEventListener('scroll', () => {
  const nav = document.querySelector('.nav');
  const currentScrollY = window.scrollY;

  // Cambio de fondo del nav al bajar
  if (currentScrollY > 20) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }

  // --- QoL: Smart Nav (Ocultar al bajar, mostrar al subir) ---
  const delta = 90; // SENSITIVIDAD: Píxeles que hay que scrollear de un tirón para que accione.
  const techo = window.innerWidth <= 768 ? 690 : 990; // LÍMITE: Píxeles desde arriba donde la barra nunca se esconde.

  // Solo evaluamos esconder/mostrar si el recorrido es mayor a nuestro umbral de tolerancia
  if (Math.abs(currentScrollY - lastScrollY) > delta) {
    
    if (currentScrollY > lastScrollY && currentScrollY > techo) {
      nav.classList.add('nav-hidden'); // Bajó con ganas y pasó el techo -> Escondemos
    } else {
      nav.classList.remove('nav-hidden'); // Subió con ganas o está en el techo -> Mostramos
    }
    
    // Solo actualizamos la última posición si realmente superamos el umbral
    lastScrollY = currentScrollY; 
  }
  // ------------------------------------------------------------

  // Lógica del Scrollspy: iluminar el nav según la sección
  let current = '';
  const sections = document.querySelectorAll('section[id]');
  const scrollPadding = parseInt(getComputedStyle(document.documentElement).scrollPaddingTop, 10) || 91;
  const offset = scrollPadding + 10;

  sections.forEach(section => {
    const sectionTop = section.offsetTop - offset;
    if (currentScrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

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
    // Chequeamos capas de profundidad: 
    // Si el lightbox está abierto, matamos SOLO el lightbox.
    const lb = document.getElementById('lightboxOverlay');
    if (lb && lb.classList.contains('open')) {
      closeLightbox();
    } else {
      // Si no, cerramos lo que haya abajo (modal normal o carrito)
      closeModal();
      closeCart();
    }
  }
});

// --- QoL 3: Auto-resize del mensaje de contacto ---
const textarea = document.getElementById('contactMessage');
if (textarea) {
  textarea.addEventListener('input', function() {
    // Reseteamos la altura para recalcular correctamente si borra texto
    this.style.height = 'auto'; 
    // Le asignamos la altura del contenido real + unos píxeles de margen
    this.style.height = (this.scrollHeight + 5) + 'px';
  });
}
