const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_DIR = path.join(__dirname, 'data');
const BOOKS_FILE = path.join(DATA_DIR, 'books.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

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

// 8. POST /api/orders (Create checkout order)
app.post('/api/orders', (req, res) => {
  const { customer, items, paymentMethod } = req.body;
  if (!customer || !items || !items.length) {
    return res.status(400).json({ success: false, message: 'Müşderi maglumatlary we harytlar zerur' });
  }

  const orders = readData(ORDERS_FILE);
  const subtotal = items.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const deliveryFee = customer.city === 'Aşgabat' ? 15.00 : 25.00;
  const total = subtotal + deliveryFee;

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
    items,
    subtotal,
    deliveryFee,
    total,
    paymentMethod: paymentMethod || 'nagt',
    status: 'taze' // taze, tayyarlanyar, ugradyldy, gowshuryldy
  };

  orders.unshift(newOrder);
  writeData(ORDERS_FILE, orders);

  res.status(201).json({
    success: true,
    message: 'Sargydyňyz kabul edildi!',
    data: newOrder
  });
});

// 9. PATCH /api/orders/:id/status (Admin updates order status)
app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const orders = readData(ORDERS_FILE);
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Sargyt tapylmady' });
  }

  order.status = status;
  writeData(ORDERS_FILE, orders);
  res.json({ success: true, message: 'Sargyt ýagdaýy täzelendi', data: order });
});

// 10. GET /api/stats (Admin dashboard metrics)
app.get('/api/stats', (req, res) => {
  const books = readData(BOOKS_FILE);
  const orders = readData(ORDERS_FILE);

  const totalBooks = books.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'taze' || o.status === 'tayyarlanyar').length;

  res.json({
    success: true,
    data: {
      totalBooks,
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2),
      pendingOrders
    }
  });
});

// Fallback to index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Türkmen Kitap Dükany serweri işläp dur: http://localhost:${PORT}`);
});

