from reportlab.pdfgen import canvas

def create_dummy_pdf():
    c = canvas.Canvas("data/panduan_warga_rt04.pdf")
    c.drawString(100, 750, "PANDUAN WARGA RT 04 KEMAYORAN")
    c.drawString(100, 730, "1. Iuran bulanan sebesar Rp 50.000 wajib dibayar tanggal 10.")
    c.drawString(100, 710, "2. Jadwal ronda dilakukan setiap malam minggu bergilir.")
    c.drawString(100, 690, "3. Tamu menginap lebih dari 24 jam wajib lapor RT.")
    c.drawString(100, 670, "4. Kerja bakti dilakukan setiap minggu pertama hari Minggu.")
    c.save()

if __name__ == "__main__":
    create_dummy_pdf()
