// App State
const state = {
  lang: localStorage.getItem('tkd_lang') || 'tm',
  theme: localStorage.getItem('tkd_theme') || 'light',
  books: [],
  categories: [],
  category: 'all',
  search: '',
  sort: 'newest',
  cart: JSON.parse(localStorage.getItem('tkd_cart') || '[]'),
  favorites: JSON.parse(localStorage.getItem('tkd_favorites') || '[]'),
  currentBook: null
};

// DOM Elements
const booksGrid = document.getElementById('booksGrid');
const categoryChips = document.getElementById('categoryChips');
const booksCount = document.getElementById('booksCount');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const langSelect = document.getElementById('langSelect');
const themeToggle = document.getElementById('themeToggle');
const cartBtn = document.getElementById('cartBtn');
const favBtn = document.getElementById('favBtn');
const adminBtn = document.getElementById('adminBtn');
const cartDrawer = document.getElementById('cartDrawer');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItemsContainer = document.getElementById('cartItems');
const cartSubtotalEl = document.getElementById('cartSubtotal');
const cartTotalEl = document.getElementById('cartTotal');
const cartBadge = document.getElementById('cartBadge');
const favBadge = document.getElementById('favBadge');
const checkoutBtn = document.getElementById('checkoutBtn');

// Modals
const bookModal = document.getElementById('bookModal');
const bookModalBody = document.getElementById('bookModalBody');
const closeBookModal = document.getElementById('closeBookModal');

const checkoutModal = document.getElementById('checkoutModal');
const closeCheckoutModal = document.getElementById('closeCheckoutModal');
const checkoutForm = document.getElementById('checkoutForm');

const adminModal = document.getElementById('adminModal');
const closeAdminModal = document.getElementById('closeAdminModal');
const addBookForm = document.getElementById('addBookForm');

const favoritesModal = document.getElementById('favoritesModal');
const closeFavModal = document.getElementById('closeFavModal');
const favItemsContainer = document.getElementById('favItems');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(state.theme);
  langSelect.value = state.lang;
  applyLanguage(state.lang);
  
  fetchCategories();
  fetchBooks();
  updateCartUI();
  updateFavoritesUI();
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  langSelect.addEventListener('change', (e) => {
    state.lang = e.target.value;
    localStorage.setItem('tkd_lang', state.lang);
    applyLanguage(state.lang);
    renderCategories();
    renderBooks();
  });

  themeToggle.addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('tkd_theme', state.theme);
    applyTheme(state.theme);
  });

  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.search = e.target.value.trim();
      fetchBooks();
    }, 250);
  });

  sortSelect.addEventListener('change', (e) => {
    state.sort = e.target.value;
    fetchBooks();
  });

  cartBtn.addEventListener('click', () => cartDrawer.classList.add('active'));
  closeCartBtn.addEventListener('click', () => cartDrawer.classList.remove('active'));

  favBtn.addEventListener('click', () => {
    renderFavorites();
    favoritesModal.classList.add('active');
  });
  closeFavModal.addEventListener('click', () => favoritesModal.classList.remove('active'));

  adminBtn.addEventListener('click', () => {
    loadAdminStats();
    loadAdminOrders();
    adminModal.classList.add('active');
  });
  closeAdminModal.addEventListener('click', () => adminModal.classList.remove('active'));

  closeBookModal.addEventListener('click', () => bookModal.classList.remove('active'));
  closeCheckoutModal.addEventListener('click', () => checkoutModal.classList.remove('active'));

  checkoutBtn.addEventListener('click', () => {
    if (state.cart.length === 0) return;
    cartDrawer.classList.remove('active');
    checkoutModal.classList.add('active');
  });

  checkoutForm.addEventListener('submit', handleCheckout);
  addBookForm.addEventListener('submit', handleAddBook);

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('active');
    }
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function t(key) {
  const dict = translations[state.lang] || translations.tm;
  return dict[key] || key;
}

function applyLanguage(lang) {
  const dict = translations[lang] || translations.tm;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  searchInput.placeholder = t('searchPlaceholder');
}

// Fetch categories
async function fetchCategories() {
  try {
    const res = await fetch('/api/categories');
    const json = await res.json();
    if (json.success) {
      state.categories = json.data;
      renderCategories();
    }
  } catch (err) {
    console.error('Error fetching categories:', err);
  }
}

function renderCategories() {
  categoryChips.innerHTML = '';
  state.categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `category-chip ${state.category === cat.id ? 'active' : ''}`;
    
    // Choose localized name
    let name = cat.nameTm;
    if (state.lang === 'uz') name = cat.nameUz;
    else if (state.lang === 'ru') name = cat.nameRu;
    else if (state.lang === 'en') name = cat.nameEn;

    btn.textContent = name;
    btn.addEventListener('click', () => {
      state.category = cat.id;
      document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      fetchBooks();
    });
    categoryChips.appendChild(btn);
  });
}

// Fetch Books from API
async function fetchBooks() {
  try {
    let url = `/api/books?category=${state.category}&sort=${state.sort}`;
    if (state.search) url += `&search=${encodeURIComponent(state.search)}`;

    const res = await fetch(url);
    const json = await res.json();
    if (json.success) {
      state.books = json.data;
      renderBooks();
    }
  } catch (err) {
    console.error('Error fetching books:', err);
  }
}

function renderBooks() {
  booksGrid.innerHTML = '';
  booksCount.textContent = `${state.books.length} ${t('statBooks').toLowerCase()}`;

  if (state.books.length === 0) {
    booksGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
      <h3>Kitap tapylmady</h3>
      <p>Başga gözleg sözüni ýa-da bölümi saýlap görüň.</p>
    </div>`;
    return;
  }

  state.books.forEach(book => {
    const isFav = state.favorites.includes(book.id);
    const inCart = state.cart.some(i => i.id === book.id);

    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <div class="book-cover-wrapper" style="background: linear-gradient(135deg, ${getGradient(book.category)});">
        <button class="fav-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite('${book.id}')" title="Halanlaryma goş">
          ${isFav ? '❤️' : '🤍'}
        </button>
        <div class="book-cover-badge">${book.badge || t('badgeClassic')}</div>
        <div class="book-cover-text">
          <div class="book-cover-title">${escapeHtml(book.title)}</div>
          <div class="book-cover-author">${escapeHtml(book.author)}</div>
        </div>
      </div>
      <div class="book-info">
        <div class="book-meta">
          <div class="book-title" onclick="openBookModal('${book.id}')">${escapeHtml(book.title)}</div>
          <div class="book-author">${escapeHtml(book.author)}</div>
          <div class="book-rating">
            <span>⭐ ${book.rating.toFixed(1)}</span>
            <span class="rating-count">(${book.reviewsCount})</span>
          </div>
        </div>
        <div class="book-footer">
          <div class="price-tag">
            <span class="current-price">${book.price.toFixed(2)} ${t('currency')}</span>
            ${book.oldPrice ? `<span class="old-price">${book.oldPrice.toFixed(2)} ${t('currency')}</span>` : ''}
          </div>
          <button class="btn-add-cart" onclick="addToCart('${book.id}')">
            ${inCart ? '✓ ' + t('inCart') : '+ ' + t('addToCart')}
          </button>
        </div>
      </div>
    `;

    // Click card cover to open modal
    card.querySelector('.book-cover-wrapper').addEventListener('click', () => openBookModal(book.id));
    booksGrid.appendChild(card);
  });
}

function getGradient(category) {
  const gradients = {
    klassyka: '#065f46, #042f2e',
    roman: '#9a3412, #451a03',
    sygyryet: '#6b21a8, #3b0764',
    powest: '#9f1239, #4c0519',
    cagalar: '#0369a1, #082f49',
    ylmy: '#0f766e, #134e4a',
    dunya: '#1d4ed8, #172554'
  };
  return gradients[category] || '#1e293b, #0f172a';
}

// Book Details Modal
function openBookModal(bookId) {
  const book = state.books.find(b => b.id === bookId);
  if (!book) return;
  state.currentBook = book;

  const inCart = state.cart.some(i => i.id === book.id);
  const reviewsHtml = (book.reviews && book.reviews.length > 0)
    ? book.reviews.map(r => `
        <div style="background: var(--bg-primary); padding: 0.75rem; border-radius: 8px; margin-bottom: 0.5rem; font-size: 0.85rem;">
          <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 0.25rem;">
            <span>${escapeHtml(r.user)}</span>
            <span style="color: var(--accent);">⭐ ${r.rating}</span>
          </div>
          <p style="color: var(--text-muted);">${escapeHtml(r.comment)}</p>
        </div>
      `).join('')
    : `<p style="color: var(--text-muted); font-size: 0.85rem;">Entek teswir ýazylmandyr. Ilkinji bolup siz ýazyň!</p>`;

  bookModalBody.innerHTML = `
    <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
      <div style="width: 180px; height: 260px; border-radius: 12px; background: linear-gradient(135deg, ${getGradient(book.category)}); color: white; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 10px 20px rgba(0,0,0,0.2);">
        <span style="font-size: 0.75rem; background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; align-self: flex-start;">${book.badge || 'Klassika'}</span>
        <div>
          <h3 style="font-size: 1.1rem; font-weight: 800; line-height: 1.2;">${escapeHtml(book.title)}</h3>
          <p style="font-size: 0.8rem; opacity: 0.8; margin-top: 4px;">${escapeHtml(book.author)}</p>
        </div>
      </div>
      <div style="flex: 1; min-width: 260px;">
        <h2 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 0.35rem;">${escapeHtml(book.title)}</h2>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 0.75rem;">Awtory: <strong>${escapeHtml(book.author)}</strong></p>
        
        <div style="display: flex; gap: 1rem; margin-bottom: 1rem; font-size: 0.85rem; color: var(--text-muted);">
          <span>📖 ${book.pages} sahypa</span>
          <span>📅 ${book.year}-nji ýyl</span>
          <span>🌐 ${book.language}</span>
          <span>⭐ ${book.rating.toFixed(1)}</span>
        </div>

        <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary); margin-bottom: 1rem;">
          ${book.price.toFixed(2)} ${t('currency')}
          ${book.oldPrice ? `<span style="font-size: 0.9rem; text-decoration: line-through; color: var(--text-muted); margin-left: 0.5rem;">${book.oldPrice.toFixed(2)} ${t('currency')}</span>` : ''}
        </div>

        <p style="font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem; color: var(--text-main);">${escapeHtml(book.description)}</p>

        <button class="btn-primary" style="width: 100%; justify-content: center;" onclick="addToCart('${book.id}'); bookModal.classList.remove('active');">
          ${inCart ? '✓ ' + t('inCart') : '+ ' + t('addToCart')}
        </button>
      </div>
    </div>

    <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--border);" />

    <div>
      <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem;">${t('reviews')} (${book.reviewsCount})</h3>
      <div style="max-height: 200px; overflow-y: auto; margin-bottom: 1rem;">
        ${reviewsHtml}
      </div>

      <div style="background: var(--bg-primary); padding: 1rem; border-radius: 12px; border: 1px solid var(--border);">
        <h4 style="font-size: 0.9rem; margin-bottom: 0.5rem;">${t('leaveReview')}</h4>
        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
          <input type="text" id="reviewUser" placeholder="${t('yourName')}" class="form-control" style="flex: 2;" required />
          <select id="reviewRating" class="form-control" style="flex: 1;">
            <option value="5">⭐⭐⭐⭐⭐ (5)</option>
            <option value="4">⭐⭐⭐⭐ (4)</option>
            <option value="3">⭐⭐⭐ (3)</option>
          </select>
        </div>
        <textarea id="reviewComment" placeholder="${t('yourComment')}" class="form-control" rows="2" style="margin-bottom: 0.5rem;" required></textarea>
        <button class="btn-primary" style="padding: 0.4rem 0.9rem; font-size: 0.85rem;" onclick="submitReview('${book.id}')">${t('submitReview')}</button>
      </div>
    </div>
  `;

  bookModal.classList.add('active');
}

// Submit Review
async function submitReview(bookId) {
  const user = document.getElementById('reviewUser').value.trim();
  const rating = document.getElementById('reviewRating').value;
  const comment = document.getElementById('reviewComment').value.trim();

  if (!user || !comment) {
    alert('Haýyş, adyňyzy we teswiriňizi doly ýazyň.');
    return;
  }

  try {
    const res = await fetch(`/api/books/${bookId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, rating, comment })
    });
    const json = await res.json();
    if (json.success) {
      await fetchBooks();
      openBookModal(bookId);
    }
  } catch (err) {
    console.error('Error submitting review:', err);
  }
}

// Cart Logic
function addToCart(bookId) {
  const book = state.books.find(b => b.id === bookId);
  if (!book) return;

  const existing = state.cart.find(i => i.id === bookId);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({
      id: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      quantity: 1
    });
  }

  saveCart();
  updateCartUI();
  renderBooks();
}

function updateCartQty(bookId, delta) {
  const item = state.cart.find(i => i.id === bookId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter(i => i.id !== bookId);
  }

  saveCart();
  updateCartUI();
  renderBooks();
}

function saveCart() {
  localStorage.setItem('tkd_cart', JSON.stringify(state.cart));
}

function updateCartUI() {
  const totalCount = state.cart.reduce((sum, i) => sum + i.quantity, 0);
  cartBadge.textContent = totalCount;
  cartBadge.style.display = totalCount > 0 ? 'flex' : 'none';

  if (state.cart.length === 0) {
    cartItemsContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2rem 0;">${t('cartEmpty')}</div>`;
    cartSubtotalEl.textContent = `0.00 ${t('currency')}`;
    cartTotalEl.textContent = `0.00 ${t('currency')}`;
    checkoutBtn.disabled = true;
    return;
  }

  checkoutBtn.disabled = false;
  cartItemsContainer.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-title">${escapeHtml(item.title)}</div>
        <div class="cart-item-price">${(item.price * item.quantity).toFixed(2)} ${t('currency')} (${item.price} x ${item.quantity})</div>
      </div>
      <div class="qty-control">
        <button class="qty-btn" onclick="updateCartQty('${item.id}', -1)">-</button>
        <span style="font-weight: 700; font-size: 0.9rem; min-width: 20px; text-align: center;">${item.quantity}</span>
        <button class="qty-btn" onclick="updateCartQty('${item.id}', 1)">+</button>
      </div>
    </div>
  `).join('');

  const subtotal = state.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const delivery = 15.00;
  cartSubtotalEl.textContent = `${subtotal.toFixed(2)} ${t('currency')}`;
  cartTotalEl.textContent = `${(subtotal + delivery).toFixed(2)} ${t('currency')}`;
}

// Favorites Logic
function toggleFavorite(bookId) {
  if (state.favorites.includes(bookId)) {
    state.favorites = state.favorites.filter(id => id !== bookId);
  } else {
    state.favorites.push(bookId);
  }
  localStorage.setItem('tkd_favorites', JSON.stringify(state.favorites));
  updateFavoritesUI();
  renderBooks();
}

function updateFavoritesUI() {
  favBadge.textContent = state.favorites.length;
  favBadge.style.display = state.favorites.length > 0 ? 'flex' : 'none';
}

function renderFavorites() {
  const favBooks = state.books.filter(b => state.favorites.includes(b.id));
  if (favBooks.length === 0) {
    favItemsContainer.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 2rem;">${t('favoritesEmpty')}</p>`;
    return;
  }

  favItemsContainer.innerHTML = favBooks.map(b => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border-bottom: 1px solid var(--border);">
      <div>
        <h4 style="font-size: 0.95rem;">${escapeHtml(b.title)}</h4>
        <p style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(b.author)} • ${b.price.toFixed(2)} ${t('currency')}</p>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <button class="btn-primary" style="padding: 0.35rem 0.7rem; font-size: 0.8rem;" onclick="addToCart('${b.id}'); favoritesModal.classList.remove('active');">+ ${t('addToCart')}</button>
        <button class="btn-icon" style="width: 32px; height: 32px;" onclick="toggleFavorite('${b.id}'); renderFavorites();">🗑️</button>
      </div>
    </div>
  `).join('');
}

// Checkout Submit
async function handleCheckout(e) {
  e.preventDefault();
  const formData = new FormData(checkoutForm);
  const orderData = {
    customer: {
      fullName: formData.get('fullName'),
      phone: formData.get('phone'),
      city: formData.get('city'),
      address: formData.get('address'),
      notes: formData.get('notes')
    },
    items: state.cart,
    paymentMethod: formData.get('paymentMethod')
  };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    const json = await res.json();
    if (json.success) {
      alert(`${t('orderSuccess')}${json.data.id}\nSiziň bilen tiz wagtda habarlaşarys!`);
      state.cart = [];
      saveCart();
      updateCartUI();
      checkoutModal.classList.remove('active');
      checkoutForm.reset();
    }
  } catch (err) {
    alert('Ýalňyşlyk ýüze çykdy. Gaýtadan synanyşyň.');
    console.error(err);
  }
}

// Admin Panel Logic
async function loadAdminStats() {
  try {
    const res = await fetch('/api/stats');
    const json = await res.json();
    if (json.success) {
      document.getElementById('adminStatBooks').textContent = json.data.totalBooks;
      document.getElementById('adminStatOrders').textContent = json.data.totalOrders;
      document.getElementById('adminStatRevenue').textContent = `${json.data.totalRevenue} ${t('currency')}`;
      document.getElementById('adminStatPending').textContent = json.data.pendingOrders;
    }
  } catch (err) {
    console.error(err);
  }
}

async function loadAdminOrders() {
  try {
    const res = await fetch('/api/orders');
    const json = await res.json();
    if (json.success) {
      const container = document.getElementById('adminOrdersTable');
      if (json.data.length === 0) {
        container.innerHTML = '<tr><td colspan="6" style="text-align: center;">Sargyt ýok</td></tr>';
        return;
      }

      container.innerHTML = json.data.map(order => `
        <tr>
          <td><strong>${order.id}</strong></td>
          <td>${escapeHtml(order.customer.fullName)}<br><small style="color: var(--text-muted);">${order.customer.phone}</small></td>
          <td>${order.customer.city}</td>
          <td>${order.items.length} kitap (${order.total.toFixed(2)} ${t('currency')})</td>
          <td>
            <select class="status-badge status-${order.status}" onchange="updateOrderStatus('${order.id}', this.value)">
              <option value="taze" ${order.status === 'taze' ? 'selected' : ''}>Täze</option>
              <option value="tayyarlanyar" ${order.status === 'tayyarlanyar' ? 'selected' : ''}>Taýýarlanýar</option>
              <option value="ugradyldy" ${order.status === 'ugradyldy' ? 'selected' : ''}>Ugradyldy</option>
              <option value="gowshuryldy" ${order.status === 'gowshuryldy' ? 'selected' : ''}>Gowşuryldy</option>
            </select>
          </td>
          <td>
            <small>${new Date(order.createdAt).toLocaleDateString()}</small>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error(err);
  }
}

async function updateOrderStatus(orderId, status) {
  try {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    loadAdminStats();
    loadAdminOrders();
  } catch (err) {
    console.error(err);
  }
}

async function handleAddBook(e) {
  e.preventDefault();
  const formData = new FormData(addBookForm);
  const newBook = {
    title: formData.get('title'),
    author: formData.get('author'),
    category: formData.get('category'),
    price: formData.get('price'),
    pages: formData.get('pages'),
    year: formData.get('year'),
    description: formData.get('description'),
    stock: 20
  };

  try {
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBook)
    });
    const json = await res.json();
    if (json.success) {
      alert('Täze kitap üstünlikli goşuldy!');
      addBookForm.reset();
      fetchBooks();
      loadAdminStats();
    }
  } catch (err) {
    console.error(err);
  }
}

// Utility
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Expose globals for inline HTML event handlers
window.addToCart = addToCart;
window.updateCartQty = updateCartQty;
window.toggleFavorite = toggleFavorite;
window.openBookModal = openBookModal;
window.submitReview = submitReview;
window.updateOrderStatus = updateOrderStatus;
window.renderFavorites = renderFavorites;
