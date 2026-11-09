const fs = require('fs');
const path = require('path');

const booksPath = path.join(__dirname, '..', 'data', 'books.json');
const ordersPath = path.join(__dirname, '..', 'data', 'orders.json');

const books = JSON.parse(fs.readFileSync(booksPath, 'utf8'));

// Enrich books
books.forEach((b, index) => {
  // 1. Cost Price (Tannarx: typically 50-65% of regular price)
  const ratio = 0.50 + ((b.id.length + (b.pages || 200)) % 15) * 0.01;
  b.costPrice = parseFloat((b.price * ratio).toFixed(2));

  // 2. Stock inventory
  if (index === 5 || index === 14) {
    b.stock = 0; // Out of stock sample
  } else if (index === 2 || index === 8 || index === 21) {
    b.stock = 3; // Low stock alert sample
  } else if (typeof b.stock !== 'number' || b.stock < 0) {
    b.stock = Math.floor(12 + Math.random() * 38);
  }

  // 3. Discount & Original Price
  if (b.oldPrice && b.oldPrice > b.price) {
    b.originalPrice = b.oldPrice;
    b.discountPercent = Math.round(((b.oldPrice - b.price) / b.oldPrice) * 100);
  } else if (index % 4 === 0) {
    // 25% of books have discount
    b.originalPrice = parseFloat((b.price * 1.25).toFixed(2));
    b.discountPercent = 20;
    b.oldPrice = b.originalPrice;
  } else {
    b.originalPrice = b.price;
    b.discountPercent = 0;
    b.oldPrice = null;
  }

  // 4. Sales count
  if (typeof b.soldCount !== 'number') {
    if (b.id === 'book-1' || b.id === 'book-4' || b.id === 'book-28') {
      b.soldCount = 145; // Super best sellers
    } else {
      b.soldCount = Math.floor(8 + Math.random() * 60);
    }
  }
});

fs.writeFileSync(booksPath, JSON.stringify(books, null, 2), 'utf8');
console.log(`Enriched ${books.length} books with costPrice, stock, discounts, and soldCount.`);

