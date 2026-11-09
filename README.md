# 🦅 L.BookShop — Onlaýn Kitap Dükany
🌐 **Domen:** [lachynbookshop.online](https://lachynbookshop.online)

Döwrebap, tiz we doly funksional onlaýn kitap söwda platformasy. Türkmen milli edebiýaty, taryhy eserler, nusgawy şygyrýet, ylmy-okuw gollanmalary we çagalar edebiýatyny özünde jemleýän internet-dükan.

---

## 🌟 Esasy Aýratynlyklary (Features)

- 🦅 **Brend we Domen:** **L.BookShop** (`lachynbookshop.online`).
- 👤 **Ýönekeý Giriş we Profil:** Diňe **Login** we **Parol** (Telefon we email gerek däl!).
- 🌐 **Köp dillilik (i18n):** Türkmençe (TM), O'zbekcha (UZ), Русский (RU), English (EN).
- 📚 **215+ Kitap:** Her bir kitap üçin giňişleýin düşündiriş we hakyky okyjy teswirleri (bahalandyrmalar).
- 🎨 **Döwrebap Dizaýn:** Responsive mobil/planshet/desktop, ýagty we garaňky tema (Dark/Light Mode).
- 🔍 **Akylly Gözleg we Kategoriýalar:** Bölümler boýunça sanawlar (Klassika, Taryhy romanlar, Şygyrýet, Ylym we IT, Çagalar, Dünýä edebiýaty).
- 🛒 **Sebet (Cart) & Halanlarym (Wishlist):** LocalStorage arkaly ýatda saklanýan harytlar, mukdary sazlamak, eltip bermek bahasyny hasaplamak.
- 📦 **Meniň Sargytlarym & Tracking:** Ähli sargyt edilen harytlary anyk atlary, bahalary we sargyt kody (mysal: `TKD-2960`) boýunça yzarlamak.
- ⚙️ **Aýratyn Admin Dolandyryş Paneli (Standalone Dashboard):**
  - Domen: **`admin.lachynbookshop.online`** (ýa-da ýerli: `/admin`).
  - Müşderi dükanyndan doly aýrylan, goragly administrator kabineti.
  - Jemi kitaplar, sargytlar sany, girdeji statistikasy we ulanyjylar hasaby.
  - Täze kitap goşmak we aýyrmak.
  - Sargytlaryň sanawy we olaryň ýagdaýyny («Täze», «Taýýarlanýar», «Ugradyldy», «Gowşuryldy») bir basyşda üýtgetmek.

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
*Awto-täzelenme üçin (dev mode):*
```bash
npm run dev
```

3. **Brauzerde açmak:**
```
http://localhost:3000
```
*Online domen:*
```
https://lachynbookshop.online
```

---

## 🗂️ Taslamanyň Gurluşy (Project Structure)

```text
Turkmen-Kitap-Dukany/
├── server.js              # Express REST API serweri
├── package.json           # Taslama maglumatlary we baglylyklar
├── data/                  # Maglumatlar bazasy (JSON)
│   ├── books.json         # 215 sany doly maglumatly kitap
│   ├── orders.json        # Sargytlar sanawy
│   └── users.json         # Ulanyjylar bazasy (Login + Parol)
├── public/                # Frontend faýllary
│   ├── index.html         # Müşderi dükany (lachynbookshop.online)
│   ├── admin.html         # Administrator paneli (admin.lachynbookshop.online)
│   ├── styles.css         # CSS dizaýn, dark mode we animasiýalar
│   ├── i18n.js            # 4 dildäki terjimeler (TM, UZ, RU, EN)
│   ├── app.js             # Client-side JavaScript logika
│   └── assets/            # Brend logotipleri (SVG, 3D emblem)
├── scripts/
│   └── generate_books.js  # 215+ kitap dörediji skript
└── README.md              # Taslama gollanmasy
```

---

## 🔐 Synag Hasaplary:

### 👤 Müşderi Hasaby (Storefront):
- **Web-saýt:** [lachynbookshop.online](https://lachynbookshop.online) (`http://localhost:3000`)
- **Login:** `batyr`
- **Açarsöz (Parol):** `123456`

### 🛡️ Administrator Hasaby (Admin Portal):
- **Web-saýt:** [admin.lachynbookshop.online](https://admin.lachynbookshop.online) (`http://localhost:3000/admin`)
- **Login:** `admin`
- **Açarsöz (Parol):** `admin123`

---

## 🌐 Nginx Subdomen Sazlamasy (Production):
```nginx
# 1. Esasy dükan (lachynbookshop.online)
server {
    server_name lachynbookshop.online www.lachynbookshop.online;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 2. Aýratyn Admin portal (admin.lachynbookshop.online)
server {
    server_name admin.lachynbookshop.online;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📜 Awtor we Hukuklar
&copy; 2026 **L.BookShop** ([lachynbookshop.online](https://lachynbookshop.online)). Ähli hukuklar goralan.
