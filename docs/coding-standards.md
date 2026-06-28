# Coding Standards

## General rules
- Jelas
- Modular
- Reusable
- Predictable
- Maintainable

## Naming
- Component: PascalCase
- Function: camelCase
- Constant: UPPER_SNAKE_CASE
- CSS variable: descriptive and systematic

## Structure
- Satu komponen satu tanggung jawab utama.
- Jangan menaruh semua logic dalam satu file.
- Pisahkan presentational dan business logic bila perlu.
- Hindari nested complexity yang tidak perlu.

## Styling
- Gunakan design tokens.
- Jangan hardcode warna, spacing, radius, atau shadow yang acak.
- Jangan membuat style yang bertentangan dengan sistem.

## Logic
- Hindari duplikasi.
- Buat helper bila perlu.
- Jangan menulis kode yang terlalu cerdas tapi sulit dipahami.

## Quality
- Semua perubahan harus mudah dicek ulang.
- Kode harus siap dipelihara oleh manusia, bukan hanya bisa dijalankan.
