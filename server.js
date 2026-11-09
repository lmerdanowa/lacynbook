const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Admin subdomain & /admin routing (admin.lachynbookshop.online or /admin)
app.use((req, res, next) => {
  const host = (req.headers.host || '').toLowerCase();
  const isAdminHost = host.startsWith('admin.') || host.startsWith('admin:');

  // If accessed via admin subdomain (e.g. admin.lachynbookshop.online)
  if (isAdminHost) {
    if (req.path === '/' || req.path === '/index.html' || req.path === '/admin' || req.path === '/admin.html') {
      return res.sendFile(path.join(__dirname, 'public', 'admin.html'));
    }
  }

  // If accessed via /admin or /admin/ on any domain
  if (req.path === '/admin' || req.path === '/admin/' || req.path === '/admin.html') {
    return res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  }

  next();
});

app.use(express.static(path.join(__dirname, 'public')));

const DATA_DIR = path.join(__dirname, 'data');
const BOOKS_FILE = path.join(DATA_DIR, 'books.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Helper to read JSON
function readData(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
}

// Helper to write JSON
function writeData(filePath, data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// Categories list
const CATEGORIES = [
  { id: 'all', nameTm: 'Ählisi', nameUz: 'Barchasi', nameRu: 'Все книги', nameEn: 'All Books' },
  { id: 'klassyka', nameTm: 'Klassyky edebiýat', nameUz: 'Klassik adabiyot', nameRu: 'Классическая литература', nameEn: 'Classical Literature' },
  { id: 'roman', nameTm: 'Taryhy romanlar', nameUz: 'Tarixiy romanlar', nameRu: 'Исторические романы', nameEn: 'Historical Novels' },
  { id: 'sygyryet', nameTm: 'Şygyrýet', nameUz: 'She’riyat', nameRu: 'Поэзия', nameEn: 'Poetry' },
  { id: 'powest', nameTm: 'Powest & Hekaýalar', nameUz: 'Qissa & Hikoyalar', nameRu: 'Повести и рассказы', nameEn: 'Novellas & Stories' },
  { id: 'cagalar', nameTm: 'Çagalar edebiýaty', nameUz: 'Bolalar adabiyoti', nameRu: 'Детская литература', nameEn: 'Children’s Literature' },
  { id: 'ylmy', nameTm: 'Ylmy & Okuw', nameUz: 'Ilmiy & Darsliklar', nameRu: 'Наука и учеба', nameEn: 'Science & Education' },
  { id: 'dunya', nameTm: 'Dünýä edebiýaty', nameUz: 'Jahon adabiyoti', nameRu: 'Мировая литература', nameEn: 'World Literature' }
];

// 1. GET /api/categories
app.get('/api/categories', (req, res) => {
  const books = readData(BOOKS_FILE);
  const enriched = CATEGORIES.map(cat => {
    const count = cat.id === 'all'
      ? books.length
      : books.filter(b => b.category.toLowerCase() === cat.id.toLowerCase()).length;
    return { ...cat, count };
  });
  res.json({ success: true, data: enriched });
});

// 2. GET /api/books
app.get('/api/books', (req, res) => {
  let books = readData(BOOKS_FILE);
  const { category, search, sort, minPrice, maxPrice } = req.query;

  if (category && category !== 'all') {
    books = books.filter(b => b.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase().trim();
    books = books.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q)
    );
  }

  if (minPrice) {
    books = books.filter(b => b.price >= parseFloat(minPrice));
  }

  if (maxPrice) {
    books = books.filter(b => b.price <= parseFloat(maxPrice));
  }

  if (sort) {
    if (sort === 'price-asc') {
      books.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      books.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      books.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'newest') {
      books.sort((a, b) => b.year - a.year);
    }
  }

  res.json({ success: true, count: books.length, data: books });
});

// 3. GET /api/books/:id
app.get('/api/books/:id', (req, res) => {
  const books = readData(BOOKS_FILE);
  const book = books.find(b => b.id === req.params.id);
  if (!book) {
    return res.status(404).json({ success: false, message: 'Kitap tapylmady' });
  }
  res.json({ success: true, data: book });
});

// 4. POST /api/books (Admin adds book)
app.post('/api/books', (req, res) => {
  const { title, author, category, price, pages, year, description, language } = req.body;
  if (!title || !author || !price) {
    return res.status(400).json({ success: false, message: 'Title, author we price hökmanydyr' });
  }

  const books = readData(BOOKS_FILE);
  const newBook = {
    id: `book-${Date.now()}`,
    title,
    author,
    category: category || 'klassyka',
    price: parseFloat(price),
    oldPrice: req.body.oldPrice ? parseFloat(req.body.oldPrice) : null,
    rating: 5.0,
    reviewsCount: 0,
    pages: parseInt(pages) || 200,
    year: parseInt(year) || new Date().getFullYear(),
    language: language || 'Türkmençe',
    stock: parseInt(req.body.stock) || 10,
    badge: 'Täze',
    gradient: 'from-emerald-800 to-slate-900',
    description: description || 'Kitap barada giňişleýin maglumat ýakyn wagtda goşular.',
    reviews: []
  };

  books.unshift(newBook);
  writeData(BOOKS_FILE, books);

  res.status(201).json({ success: true, message: 'Kitap üstünlikli goşuldy', data: newBook });
});

// 5. DELETE /api/books/:id (Admin deletes book)
app.delete('/api/books/:id', (req, res) => {
  let books = readData(BOOKS_FILE);
  const index = books.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Kitap tapylmady' });
  }

  const deleted = books.splice(index, 1)[0];
  writeData(BOOKS_FILE, books);
  res.json({ success: true, message: 'Kitap pozuldy', data: deleted });
});

// 6. POST /api/books/:id/reviews
app.post('/api/books/:id/reviews', (req, res) => {
  const { user, rating, comment } = req.body;
  if (!user || !comment) {
    return res.status(400).json({ success: false, message: 'Ulanyjy ady we teswir zerur' });
  }

  const books = readData(BOOKS_FILE);
  const book = books.find(b => b.id === req.params.id);
  if (!book) {
    return res.status(404).json({ success: false, message: 'Kitap tapylmady' });
  }

  if (!book.reviews) book.reviews = [];
  const reviewObj = {
    user,
    rating: parseInt(rating) || 5,
    comment,
    date: new Date().toISOString().split('T')[0]
  };

  book.reviews.unshift(reviewObj);
  book.reviewsCount = book.reviews.length;
  const avg = book.reviews.reduce((acc, r) => acc + r.rating, 0) / book.reviewsCount;
  book.rating = parseFloat(avg.toFixed(1));

  writeData(BOOKS_FILE, books);
  res.status(201).json({ success: true, message: 'Teswir goşuldy', data: book });
});

// 7. GET /api/orders
app.get('/api/orders', (req, res) => {
  const orders = readData(ORDERS_FILE);
  res.json({ success: true, count: orders.length, data: orders });
});

// 7.1 GET /api/orders/:id (Search single order by ID)
app.get('/api/orders/:id', (req, res) => {
  const orders = readData(ORDERS_FILE);
  const order = orders.find(o => o.id.toLowerCase() === req.params.id.toLowerCase());
  if (!order) {
    return res.status(404).json({ success: false, message: 'Sargyt tapylmady' });
  }
  res.json({ success: true, data: order });
});

// 8. POST /api/orders (Create checkout order, deduct inventory, calculate profit)
app.post('/api/orders', (req, res) => {
  const { customer, items, paymentMethod } = req.body;
  if (!customer || !items || !items.length) {
    return res.status(400).json({ success: false, message: 'Müşderi maglumatlary we harytlar zerur' });
  }

  const books = readData(BOOKS_FILE);
  const orders = readData(ORDERS_FILE);

  // 1. Stock validation check
  for (const item of items) {
    const book = books.find(b => b.id === item.id);
    if (!book) {
      return res.status(400).json({ success: false, message: `Kitap tapylmady (ID: ${item.id})` });
    }
    const reqQty = item.quantity || 1;
    if ((book.stock || 0) < reqQty) {
      if ((book.stock || 0) <= 0) {
        return res.status(400).json({
          success: false,
          message: `"${book.title}" kitaby ammarymyzda gutardy (0 sany galdy)!`
        });
      } else {
        return res.status(400).json({
          success: false,
          message: `"${book.title}" kitabyndan diňe ${book.stock} sany galdy. Sargyt sanyny azaldyň!`
        });
      }
    }
  }

  // 2. Deduct stock & record sales + cost
  let totalOrderCost = 0;
  const enrichedItems = items.map(item => {
    const book = books.find(b => b.id === item.id);
    const qty = item.quantity || 1;
    book.stock = Math.max(0, (book.stock || 0) - qty);
    book.soldCount = (book.soldCount || 0) + qty;

    const unitCost = book.costPrice || parseFloat((book.price * 0.55).toFixed(2));
    totalOrderCost += unitCost * qty;

    return {
      id: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      costPrice: unitCost,
      quantity: qty
    };
  });

  // Save updated books inventory
  writeData(BOOKS_FILE, books);

  const subtotal = enrichedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = customer.city === 'Aşgabat' ? 15.00 : 25.00;
  const total = subtotal + deliveryFee;
  const orderProfit = subtotal - totalOrderCost;

  const newOrder = {
    id: `TKD-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
    customer: {
      fullName: customer.fullName,
      phone: customer.phone,
      city: customer.city || 'Aşgabat',
      address: customer.address,
      notes: customer.notes || ''
    },
    items: enrichedItems,
    subtotal: parseFloat(subtotal.toFixed(2)),
    deliveryFee: parseFloat(deliveryFee.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    cost: parseFloat(totalOrderCost.toFixed(2)),
    profit: parseFloat(orderProfit.toFixed(2)),
    paymentMethod: paymentMethod || 'nagt',
    status: 'taze' // taze, tayyarlanyar, ugradyldy, gowshuryldy, yatyrlyldy
  };

  orders.unshift(newOrder);
  writeData(ORDERS_FILE, orders);

  res.status(201).json({
    success: true,
    message: 'Sargydyňyz üstünlikli kabul edildi!',
    data: newOrder
  });
});

// 9. PATCH /api/orders/:id/status (Admin updates order status, restores stock on cancel)
app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const orders = readData(ORDERS_FILE);
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Sargyt tapylmady' });
  }

  const prevStatus = order.status;
  order.status = status;

  // Restore inventory if cancelled
  if (status === 'yatyrlyldy' && prevStatus !== 'yatyrlyldy') {
    const books = readData(BOOKS_FILE);
    order.items.forEach(item => {
      const book = books.find(b => b.id === item.id);
      if (book) {
        book.stock = (book.stock || 0) + (item.quantity || 1);
        book.soldCount = Math.max(0, (book.soldCount || 0) - (item.quantity || 1));
      }
    });
    writeData(BOOKS_FILE, books);
  } else if (prevStatus === 'yatyrlyldy' && status !== 'yatyrlyldy') {
    // Deduct stock if un-cancelled
    const books = readData(BOOKS_FILE);
    order.items.forEach(item => {
      const book = books.find(b => b.id === item.id);
      if (book) {
        book.stock = Math.max(0, (book.stock || 0) - (item.quantity || 1));
        book.soldCount = (book.soldCount || 0) + (item.quantity || 1);
      }
    });
    writeData(BOOKS_FILE, books);
  }

  writeData(ORDERS_FILE, orders);
  res.json({ success: true, message: 'Sargyt ýagdaýy täzelendi', data: order });
});

// Helper for comprehensive business analytics
function calculateBusinessMetrics() {
  const books = readData(BOOKS_FILE);
  const orders = readData(ORDERS_FILE);

  const totalBooks = books.length;
  const totalOrders = orders.length;

  const validOrders = orders.filter(o => o.status !== 'yatyrlyldy');
  const totalRevenue = validOrders.reduce((sum, o) => sum + (o.subtotal || o.total || 0), 0);
  const totalCost = validOrders.reduce((sum, o) => sum + (o.cost || ((o.subtotal || o.total || 0) * 0.55)), 0);
  const totalProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const pendingOrders = orders.filter(o => o.status === 'taze' || o.status === 'tayyarlanyar').length;

  // Inventory
  const totalStock = books.reduce((sum, b) => sum + (b.stock || 0), 0);
  const lowStockCount = books.filter(b => (b.stock || 0) > 0 && (b.stock || 0) <= 5).length;
  const outOfStockCount = books.filter(b => (b.stock || 0) === 0).length;
  const discountedCount = books.filter(b => (b.discountPercent || 0) > 0).length;
  const totalUnitsSold = books.reduce((sum, b) => sum + (b.soldCount || 0), 0);

  // Asset values
  const inventoryAssetCost = books.reduce((sum, b) => sum + ((b.costPrice || (b.price * 0.55)) * (b.stock || 0)), 0);
  const inventoryRetailValue = books.reduce((sum, b) => sum + (b.price * (b.stock || 0)), 0);
  const inventoryProjectedProfit = inventoryRetailValue - inventoryAssetCost;

  // Top selling books
  const sorted = [...books].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
  const topSellingBooks = sorted.slice(0, 10).map(b => {
    const cost = b.costPrice || parseFloat((b.price * 0.55).toFixed(2));
    const profitPerUnit = parseFloat((b.price - cost).toFixed(2));
    return {
      id: b.id,
      title: b.title,
      author: b.author,
      category: b.category,
      price: b.price,
      costPrice: cost,
      profitPerUnit,
      stock: b.stock || 0,
      soldCount: b.soldCount || 0,
      totalRevenue: parseFloat((b.price * (b.soldCount || 0)).toFixed(2)),
      totalProfit: parseFloat((profitPerUnit * (b.soldCount || 0)).toFixed(2))
    };
  });

  // Category breakdown
  const categoryPerformance = CATEGORIES.filter(c => c.id !== 'all').map(cat => {
    const catBooks = books.filter(b => b.category.toLowerCase() === cat.id.toLowerCase());
    const stock = catBooks.reduce((sum, b) => sum + (b.stock || 0), 0);
    const sold = catBooks.reduce((sum, b) => sum + (b.soldCount || 0), 0);
    const rev = catBooks.reduce((sum, b) => sum + (b.price * (b.soldCount || 0)), 0);
    const cst = catBooks.reduce((sum, b) => sum + ((b.costPrice || (b.price * 0.55)) * (b.soldCount || 0)), 0);
    const prf = rev - cst;
    const margin = rev > 0 ? (prf / rev) * 100 : 0;
    return {
      id: cat.id,
      nameTm: cat.nameTm,
      booksCount: catBooks.length,
      stock,
      sold,
      revenue: parseFloat(rev.toFixed(2)),
      profit: parseFloat(prf.toFixed(2)),
      marginPercent: parseFloat(margin.toFixed(1))
    };
  });

  return {
    totalBooks,
    totalStock,
    totalOrders,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalCost: parseFloat(totalCost.toFixed(2)),
    totalProfit: parseFloat(totalProfit.toFixed(2)),
    profitMargin: parseFloat(profitMargin.toFixed(1)),
    pendingOrders,
    lowStockCount,
    outOfStockCount,
    discountedCount,
    totalUnitsSold,
    inventoryAssetCost: parseFloat(inventoryAssetCost.toFixed(2)),
    inventoryRetailValue: parseFloat(inventoryRetailValue.toFixed(2)),
    inventoryProjectedProfit: parseFloat(inventoryProjectedProfit.toFixed(2)),
    topSellingBooks,
    categoryPerformance
  };
}

// 10. GET /api/stats (Admin stats)
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: calculateBusinessMetrics()
  });
});

// 10.1 GET /api/admin/analytics (Detailed analytics)
app.get('/api/admin/analytics', (req, res) => {
  res.json({
    success: true,
    data: calculateBusinessMetrics()
  });
});

// 10.2 PATCH /api/admin/books/:id/stock (Quick stock adjust: absolute or delta)
app.patch('/api/admin/books/:id/stock', (req, res) => {
  const { stock, delta } = req.body;
  const books = readData(BOOKS_FILE);
  const book = books.find(b => b.id === req.params.id);
  if (!book) {
    return res.status(404).json({ success: false, message: 'Kitap tapylmady' });
  }

  if (typeof stock === 'number') {
    book.stock = Math.max(0, Math.floor(stock));
  } else if (typeof delta === 'number') {
    book.stock = Math.max(0, (book.stock || 0) + Math.floor(delta));
  } else {
    return res.status(400).json({ success: false, message: 'Stok mukdary nädogry' });
  }

  writeData(BOOKS_FILE, books);
  res.json({ success: true, message: 'Ammar sany täzelendi', data: book });
});

// 10.3 PATCH /api/admin/books/:id/discount (Discount management)
app.patch('/api/admin/books/:id/discount', (req, res) => {
  const { discountPercent, salePrice, removeDiscount } = req.body;
  const books = readData(BOOKS_FILE);
  const book = books.find(b => b.id === req.params.id);
  if (!book) {
    return res.status(404).json({ success: false, message: 'Kitap tapylmady' });
  }

  const basePrice = book.originalPrice || book.oldPrice || book.price;

  if (removeDiscount) {
    book.price = basePrice;
    book.originalPrice = basePrice;
    book.oldPrice = null;
    book.discountPercent = 0;
  } else if (typeof discountPercent === 'number' && discountPercent > 0) {
    const pct = Math.min(90, Math.max(1, Math.round(discountPercent)));
    const newPrice = parseFloat((basePrice * (1 - pct / 100)).toFixed(2));
    book.originalPrice = basePrice;
    book.oldPrice = basePrice;
    book.price = newPrice;
    book.discountPercent = pct;
  } else if (typeof salePrice === 'number' && salePrice > 0 && salePrice < basePrice) {
    const pct = Math.round(((basePrice - salePrice) / basePrice) * 100);
    book.originalPrice = basePrice;
    book.oldPrice = basePrice;
    book.price = parseFloat(salePrice.toFixed(2));
    book.discountPercent = pct;
  } else {
    return res.status(400).json({ success: false, message: 'Arzanlaşyk maglumaty nädogry' });
  }

  writeData(BOOKS_FILE, books);
  res.json({ success: true, message: 'Arzanlaşyk üstünlikli girizildi', data: book });
});

// 10.4 PUT /api/admin/books/:id/pricing (Full pricing, cost, stock, discount update)
app.put('/api/admin/books/:id/pricing', (req, res) => {
  const { price, costPrice, stock, discountPercent } = req.body;
  const books = readData(BOOKS_FILE);
  const book = books.find(b => b.id === req.params.id);
  if (!book) {
    return res.status(404).json({ success: false, message: 'Kitap tapylmady' });
  }

  if (price !== undefined) {
    const newPrice = parseFloat(price);
    if (!isNaN(newPrice) && newPrice > 0) {
      book.price = newPrice;
      if (!book.discountPercent || book.discountPercent === 0) {
        book.originalPrice = newPrice;
      }
    }
  }

  if (costPrice !== undefined) {
    const newCost = parseFloat(costPrice);
    if (!isNaN(newCost) && newCost >= 0) {
      book.costPrice = newCost;
    }
  }

  if (stock !== undefined) {
    const newStock = parseInt(stock, 10);
    if (!isNaN(newStock) && newStock >= 0) {
      book.stock = newStock;
    }
  }

  if (discountPercent !== undefined) {
    const pct = parseInt(discountPercent, 10);
    if (!isNaN(pct)) {
      if (pct <= 0) {
        book.price = book.originalPrice || book.price;
        book.oldPrice = null;
        book.discountPercent = 0;
      } else {
        const base = book.originalPrice || book.price;
        book.originalPrice = base;
        book.oldPrice = base;
        book.discountPercent = Math.min(90, pct);
        book.price = parseFloat((base * (1 - pct / 100)).toFixed(2));
      }
    }
  }

  writeData(BOOKS_FILE, books);
  res.json({ success: true, message: 'Baha we ammar maglumatlary täzelendi', data: book });
});

// 11. AUTH ROUTES (Pure Login + Password)
// 11.1 Register
app.post('/api/auth/register', (req, res) => {
  const { username, password, fullName, city, address } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Login we açarsöz hökmanydyr' });
  }

  const cleanUsername = username.trim().toLowerCase();
  if (cleanUsername.length < 3) {
    return res.status(400).json({ success: false, message: 'Login iň az 3 harpdan ybarat bolmaly' });
  }

  const users = readData(USERS_FILE);
  const existing = users.find(u => u.username && u.username.toLowerCase() === cleanUsername);
  if (existing) {
    return res.status(400).json({ success: false, message: 'Bu login eýýäm eýelenen. Başga login saýlaň.' });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    username: cleanUsername,
    fullName: fullName ? fullName.trim() : cleanUsername,
    password: password.trim(),
    city: city || 'Aşgabat',
    address: address || '',
    avatar: '📚',
    bonusPoints: 10.00, // 10 TMT sowgat bonus
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeData(USERS_FILE, users);

  const { password: _, ...userSafe } = newUser;
  res.status(201).json({ success: true, message: 'Hasabyňyz döredildi!', data: userSafe });
});

// 11.2 Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Login we açarsöz giriziň' });
  }

  const users = readData(USERS_FILE);
  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = password.trim();

  const user = users.find(u => 
    u.username && u.username.toLowerCase() === cleanUsername
  );

  if (!user || user.password !== cleanPassword) {
    return res.status(401).json({ success: false, message: 'Login ýa-da açarsöz nädogry!' });
  }

  const { password: _, ...userSafe } = user;
  res.json({ success: true, message: 'Giriş üstünlikli!', data: userSafe });
});

// 11.3 Get Profile
app.get('/api/auth/profile/:id', (req, res) => {
  const users = readData(USERS_FILE);
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Ulanyjy tapylmady' });
  }
  const { password: _, ...userSafe } = user;
  res.json({ success: true, data: userSafe });
});

// 11.4 Update Profile
app.put('/api/auth/profile/:id', (req, res) => {
  const users = readData(USERS_FILE);
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Ulanyjy tapylmady' });
  }

  const { fullName, phone, city, address, avatar } = req.body;
  if (fullName) user.fullName = fullName;
  if (phone) user.phone = phone;
  if (city) user.city = city;
  if (address) user.address = address;
  if (avatar) user.avatar = avatar;

  writeData(USERS_FILE, users);
  const { password: _, ...userSafe } = user;
  res.json({ success: true, message: 'Profil täzelendi', data: userSafe });
});

// 12. GET /api/admin/users (Admin users overview)
app.get('/api/admin/users', (req, res) => {
  const users = readData(USERS_FILE);
  const safeUsers = users.map(({ password, ...u }) => u);
  res.json({ success: true, count: safeUsers.length, data: safeUsers });
});

// Fallback routing (Subdomain & SPA)
app.use((req, res) => {
  const host = (req.headers.host || '').toLowerCase();
  const isAdminHost = host.startsWith('admin.') || host.startsWith('admin:');
  if (isAdminHost || req.path.startsWith('/admin')) {
    return res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`L.BookShop (lachynbookshop.online) serweri işläp dur: http://localhost:${PORT}`);
});

