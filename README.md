# 📚 Türkmen Kitap Dükany (Turkmen Bookstore Platform)

Döwrebap, tiz we doly funksional onlaýn kitap söwda platformasy. Türkmen milli edebiýaty, taryhy eserler, nusgawy şygyrýet, ylmy-okuw gollanmalary we çagalar edebiýatyny özünde jemleýän internet-dükan.

---

## 🌟 Esasy Aýratynlyklary (Features)

- 🌐 **Köp dillilik (i18n):** Türkmençe (TM), O'zbekcha (UZ), Русский (RU), English (EN).
- 🎨 **Döwrebap Dizaýn:** Responsive mobil/planshet/desktop, ýagty we garaňky tema (Dark/Light Mode).
- 🔍 **Akylly Gözleg we Filtrler:** Kitap ady, awtor, kategoriýa we baha boýunça tiz gözleg we tertipleşdirme.
- 🛒 **Sebet (Cart) & Halanlarym (Wishlist):** LocalStorage arkaly ýatda saklanýan harytlar, mukdary sazlamak, eltip bermek bahasyny hasaplamak.
- 📦 **Sargyt Tiz Resmileşdirmek (Checkout):** Ähli 5 welaýat (Aşgabat, Ahal, Mary, Lebap, Daşoguz, Balkan) üçin amatly sargyt formasy.
- 💬 **Teswirler we Bahalandyrma:** Kitaplara baha bermek (1-5 ýyldyz) we teswir ýazmak mümkinçiligi.
- ⚙️ **Admin Dolandyryş Paneli (Dashboard):**
  - Jemi kitaplar, sargytlar sany, girdeji statistikasy.
  - Täze kitap goşmak formasy.
  - Sargytlaryň sanawy we olaryň ýagdaýyny («Täze», «Taýýarlanýar», «Ugradyldy», «Gowşuryldy») üýtgetmek.

---

## 🚀 Taslamany Işletmek (How to Run)

### Talaplar:
- [Node.js](https://nodejs.org/) (v18+)
- npm

### Gurnamak we başlatmak:

1. **Baglylyklary gurnamak:**
```bash
npm install
```

2. **Serweri başlatmak:**
```bash
npm start
```
*Ýa-da awto-täzelenme üçin (dev mode):*
```bash
npm run dev
```

3. **Brauzerde açmak:**
```
http://localhost:3000
```

---

## 🗂️ Taslamanyň Gurluşy (Project Structure)

```text
Turkmen-Kitap-Dukany/
├── server.js              # Express REST API serweri
├── package.json           # Taslama maglumatlary we baglylyklar
├── data/                  # Maglumatlar bazasy (JSON)
│   ├── books.json         # Kitaplar bazasy (12+ taýýar nusgawy eser)
│   └── orders.json        # Sargytlar sanawy
├── public/                # Frontend faýllary
│   ├── index.html         # Esasy HTML interfeýs
│   ├── styles.css         # CSS dizaýn, dark mode we animasiýalar
│   ├── i18n.js            # 4 dildäki terjimeler (TM, UZ, RU, EN)
│   └── app.js             # Client-side JavaScript logika
└── README.md              # Taslama gollanmasy
```

---

## 📡 API Salgylary (REST API Endpoints)

| Usul | Endpoint | Düşündiriş |
|---|---|---|
| `GET` | `/api/books` | Kitaplaryň sanawy (filtr, gözleg, sort) |
| `GET` | `/api/books/:id` | Bellenen kitabyň giňişleýin maglumaty |
| `POST` | `/api/books` | Täze kitap goşmak (Admin) |
| `DELETE` | `/api/books/:id` | Kitaby pozmak (Admin) |
| `POST` | `/api/books/:id/reviews` | Kitaba teswir we baha goşmak |
| `GET` | `/api/categories` | Kategoriýalar sanawy |
| `GET` | `/api/orders` | Sargytlar sanawy (Admin) |
| `POST` | `/api/orders` | Täze sargyt resmileşdirmek (Checkout) |
| `PATCH` | `/api/orders/:id/status`| Sargydyň ýagdaýyny täzelemek |
| `GET` | `/api/stats` | Admin panel üçin umumy statistika |

---

## 📜 Awtor we Hukuklar
© 2026 **Türkmen Kitap Dükany**. MIT ygtyýarnamasy esasynda paýlanýar.

