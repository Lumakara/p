#URL Dasar : https://ramashop.my.id/api/public

#Cara Autentikasi 

Sertakan API key Anda di header permintaan: X-API-Key: your_api_key_here

#Mendapatkan Saldo
GET : /balance
untuk Mengambil saldo akun Anda saat ini.

Response (200 OK)
contoh request : 
{
  "success": true,
  "data": {
    "balance": 50000,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
Note : ini saldo yang selalu tampilkan di dashboard admin

# Membuat Deposit
POST : /deposit/create
Buat permintaan deposit baru. Anda akan menerima kode QR dengan jumlah unik untuk dibayar.

- Headers
X-API-Key string

- Content-Type string
Harus: application/json

- Request Body
amount number
Jumlah deposit dari harga produk yang di beli
method string
Metode pembayaran (default: "qris")

Contoh Request :
{
  "amount": 10000,
  "method": "qris"
}

Response (200 OK) :
{
  "success": true,
  "data": {
    "depositId": "DEP1234567890",
    "amount": 10000,
    "uniqueCode": 73,
    "totalAmount": 10073,
    "fee": 0,
    "getBalance": 10000,
    "qrImage": "https://api.qrserver.com/...",
    "qrString": "00020101021126670016...",
    "status": "pending",
    "expiredAt": "2024-01-01T13:00:00.000Z"
  },
  "message": "Silakan bayar Rp 10.073 (10.000 + kode unik 73)"
}

#Cek Status Deposit
GET : /api/public/deposit/status/{depositId}
Endpoint ini digunakan untuk mengecek status deposit QRIS secara real-time. Sistem akan mencocokkan nominal transfer dengan riwayat transaksi QRIS. Jika nominal sesuai, deposit akan otomatis dianggap berhasil.

- Headers
   X-API-Key string
   API Key akun Anda

   Content-Type string
   Gunakan application/json

- URL Parameter
   depositId string
   ID deposit yang didapat saat membuat deposit

Contoh Request :
fetch("https://ramashop.my.id/api/public/deposit/status/DEP123456", {
  headers: {
    "X-API-Key": "API_KEY_ANDA",
    "Content-Type": "application/json"
  }
})
.then(res => res.json())
.then(console.log)
        
Response (200 OK) - Berhasil :
{
  "status": true,
  "data": {
    "status": "success",
    "paidAmount": 50000,
    "paidAt": "2026-01-08T12:30:00Z"
  }
}

Response (200 OK) - Pending :
{
  "status": true,
  "data": {
    "status": "pending"
  }
}

Response (200 OK) - Sudah Diproses :
{
  "status": true,
  "data": {
    "status": "already"
  }
}

Catatan Penting : 
- Status pending berarti sistem belum menemukan transaksi QRIS yang cocok.
- Status success berarti nominal QRIS sudah terverifikasi.
- Status already berarti transaksi sudah pernah diproses sebelumnya.
- Sistem memiliki cache ±5 detik untuk mencegah spam request.

# Kode Error
API menggunakan kode status HTTP standar untuk menunjukkan keberhasilan atau kegagalan.

Kode|Status|Deskripsi
200|OK|Permintaan berhasil
400|Bad Request|Parameter tidak valid atau saldo tidak cukup
401|Unauthorized|API key tidak valid atau tidak ada
404|Not Found|Sumber daya tidak ditemukan
500|Internal Server Error|Kesalahan server

# Contoh kode
JavaScript (fetch api) : 
// Contoh penggunaan API tanpa async / await

// API Key
const API_KEY = 'YOUR_API_KEY';

// 1. Cek Saldo
fetch('https://ramashop.my.id/api/public/balance', {
  headers: {
    'X-API-Key': API_KEY
  }
})
.then(res => res.json())
.then(data => {
  console.log('Saldo:', data);
})
.catch(err => {
  console.error('Error cek saldo:', err);
});

// 2. Membuat Deposit QRIS
fetch('https://ramashop.my.id/api/public/deposit/create', {
  method: 'POST',
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 10000,
    method: 'qris'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Create Deposit:', data);

  // Ambil depositId untuk cek status
  const depositId = data.data.depositId;

  // 3. Cek Status Deposit setiap 10 detik
  const interval = setInterval(() => {
    fetch(
      `https://ramashop.my.id/api/public/deposit/status/${depositId}`,
      {
        headers: {
          'X-API-Key': API_KEY
        }
      }
    )
    .then(res => res.json())
    .then(status => {
      console.log('Status Deposit:', status);

      if (status.data.status === 'success') {
        console.log('✅ Deposit berhasil');
        clearInterval(interval);
      }

      if (status.data.status === 'already') {
        console.log('⚠️ Deposit sudah diproses');
        clearInterval(interval);
      }
    })
    .catch(err => {
      console.error('Error cek status:', err);
    });

  }, 10000);
})
.catch(err => {
  console.error('Error create deposit:', err);
});
