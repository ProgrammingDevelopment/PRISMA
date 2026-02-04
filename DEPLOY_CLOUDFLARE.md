# Panduan Deploy ke Cloudflare Pages

## Persiapan

### 1. Buat Akun Cloudflare (Jika Belum Punya)
- Kunjungi https://dash.cloudflare.com/sign-up
- Daftar dengan email

### 2. Build Project Lokal
```bash
npm run build
```
Hasil build akan ada di folder `out/`

---

## Opsi A: Deploy via Git (Rekomendasi)

### Langkah 1: Push ke GitHub/GitLab
```bash
git add .
git commit -m "Ready for Cloudflare Pages deployment"
git push origin main
```

### Langkah 2: Connect di Cloudflare
1. Buka https://dash.cloudflare.com
2. Pilih **Workers & Pages** di sidebar
3. Klik **Create application** → **Pages**
4. Pilih **Connect to Git**
5. Authorize dan pilih repository Anda

### Langkah 3: Konfigurasi Build
- **Framework preset**: Next.js (Static HTML Export)
- **Build command**: `npm run build`
- **Build output directory**: `out`
- **Root directory**: `/` (kosongkan)

### Langkah 4: Deploy
- Klik **Save and Deploy**
- Tunggu build selesai (~2-3 menit)
- Akses site di: `https://[project-name].pages.dev`

---

## Opsi B: Deploy Manual (Drag & Drop)

### Langkah 1: Build
```bash
npm run build
```

### Langkah 2: Upload
1. Buka https://dash.cloudflare.com
2. Pilih **Workers & Pages** → **Create application** → **Pages**
3. Pilih **Upload assets**
4. Drag & drop folder `out/` ke area upload
5. Klik **Deploy site**

---

## Opsi C: Deploy via Wrangler CLI

### Langkah 1: Install Wrangler
```bash
npm install -g wrangler
```

### Langkah 2: Login
```bash
wrangler login
```

### Langkah 3: Deploy
```bash
npm run build
npx wrangler pages deploy out --project-name=prisma-rt04
```

---

## Custom Domain (Opsional)

1. Di dashboard Cloudflare Pages, pilih project Anda
2. Klik tab **Custom domains**
3. Klik **Set up a custom domain**
4. Masukkan domain Anda (misal: `prisma-rt04.com`)
5. Ikuti instruksi DNS

---

## Environment Variables (Jika Diperlukan)

1. Di dashboard, pilih project → **Settings** → **Environment variables**
2. Tambahkan variabel yang diperlukan (jika ada)

---

## Troubleshooting

### Error: 404 pada halaman selain homepage
- Pastikan `trailingSlash: true` di `next.config.ts` ✅ (sudah dikonfigurasi)

### Error: Asset tidak ditemukan
- Pastikan folder `public/` ter-include dalam build

### Build gagal
- Cek log build di dashboard Cloudflare
- Pastikan Node.js version compatible (gunakan v18+)

---

## Tips
- Setiap push ke branch `main` akan auto-deploy
- Preview deployment tersedia untuk pull request
- Analytics gratis tersedia di dashboard
