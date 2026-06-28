# Animation System

## Prinsip
Animasi harus smooth, ringan, dan membantu navigasi.

## Motion language
- Halus
- Cepat
- Purposeful
- Tidak berlebihan
- Tidak membuat user menunggu

## Durasi umum
- Micro interaction: sangat singkat
- Transisi UI: singkat sampai sedang
- Modal / drawer: cukup halus
- Page transition: kalau dipakai, harus ringan

## Easing
Gunakan easing yang terasa natural, bukan memantul berlebihan.

## Animasi yang disarankan
- hover lift ringan
- scale sangat kecil
- fade in lembut
- slide pendek untuk drawer/modals
- skeleton shimmer yang subtle
- quantity change feedback
- toast muncul halus

## Animasi yang harus dihindari
- bounce berlebihan
- parallax yang mengganggu
- efek lambat tanpa alasan
- animasi yang membuat fokus hilang
- motion yang membebani performa

## Prinsip performa motion
- Gunakan transform dan opacity bila memungkinkan.
- Hindari animasi layout yang berat.
- Animasi tidak boleh mengalahkan isi.
