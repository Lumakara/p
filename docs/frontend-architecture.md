# Frontend Architecture

## Prinsip
Struktur kode harus mudah dirawat, mudah dibaca, dan siap tumbuh.

## Preferred architecture
- Feature-based organization
- Shared UI components
- Clear separation antara UI, logic, data, dan utilities
- Reusable design tokens
- Static docs sebagai sumber kebenaran

## Suggested folder shape
- app/
- components/
- features/
- hooks/
- lib/
- services/
- styles/
- types/
- utils/
- constants/
- tokens/

## Rules
- Jangan taruh semuanya dalam satu folder besar.
- Jangan membuat file yang terlalu besar kalau bisa dipisah.
- Jangan hardcode design values di banyak tempat.
- Jangan mencampur urusan data dengan urusan presentasi.

## Scalability
Struktur harus siap untuk:
- web
- app
- dashboard
- seller/admin modules
- future marketplace features

## Reusability
Setiap komponen umum harus bisa dipakai ulang tanpa editing besar.
