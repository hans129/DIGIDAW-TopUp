const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "layanan.json");

app.use(cors());
app.use(express.json());

// Helper baca & simpan data JSON
const bacaData = () => JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
const simpanData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// Endpoint Root
app.get("/", (req, res) => {
  res.json({
    message: "API Layanan PT Digidaw TopUp Digital Aktif",
    author: "24552011050 - Irpan Nurohman"
  });
});

// 1. READ ALL - Ambil semua data layanan top-up
app.get("/api/layanan", (req, res) => {
  const data = bacaData();
  res.status(200).json({
    status: "success",
    total: data.length,
    data: data
  });
});

// 2. READ BY ID - Ambil detail satu layanan
app.get("/api/layanan/:id", (req, res) => {
  const data = bacaData();
  const id = parseInt(req.params.id);
  const item = data.find((g) => g.id === id);

  if (!item) {
    return res.status(404).json({ status: "error", message: "Layanan tidak ditemukan" });
  }
  res.status(200).json({ status: "success", data: item });
});

// 3. CREATE - Tambah layanan top-up baru
app.post("/api/layanan", (req, res) => {
  const data = bacaData();
  const { nama, kategori, deskripsiSingkat, detailLengkap, hargaMulai } = req.body;

  if (!nama || !kategori || !hargaMulai) {
    return res.status(400).json({
      status: "error",
      message: "Field nama, kategori, dan hargaMulai wajib diisi!"
    });
  }

  const newId = data.length > 0 ? Math.max(...data.map((g) => g.id)) + 1 : 1;
  const layananBaru = {
    id: newId,
    nama,
    kategori,
    deskripsiSingkat: deskripsiSingkat || `Top up ${nama} resmi & instan.`,
    detailLengkap: detailLengkap || `Layanan pengisian ${nama} resmi dari PT Digidaw TopUp Digital.`,
    hargaMulai
  };

  data.push(layananBaru);
  simpanData(data);

  res.status(201).json({
    status: "success",
    message: "Layanan berhasil ditambahkan",
    data: layananBaru
  });
});

// 4. UPDATE - Ubah data layanan berdasarkan ID
app.put("/api/layanan/:id", (req, res) => {
  const data = bacaData();
  const id = parseInt(req.params.id);
  const index = data.findIndex((g) => g.id === id);

  if (index === -1) {
    return res.status(404).json({ status: "error", message: "Layanan tidak ditemukan" });
  }

  data[index] = {
    ...data[index],
    nama: req.body.nama || data[index].nama,
    kategori: req.body.kategori || data[index].kategori,
    deskripsiSingkat: req.body.deskripsiSingkat || data[index].deskripsiSingkat,
    detailLengkap: req.body.detailLengkap || data[index].detailLengkap,
    hargaMulai: req.body.hargaMulai || data[index].hargaMulai
  };

  simpanData(data);
  res.status(200).json({
    status: "success",
    message: "Layanan berhasil diperbarui",
    data: data[index]
  });
});

// 5. DELETE - Hapus layanan berdasarkan ID
app.delete("/api/layanan/:id", (req, res) => {
  const data = bacaData();
  const id = parseInt(req.params.id);
  const filtered = data.filter((g) => g.id !== id);

  if (data.length === filtered.length) {
    return res.status(404).json({ status: "error", message: "Layanan tidak ditemukan" });
  }

  simpanData(filtered);
  res.status(200).json({
    status: "success",
    message: `Layanan dengan ID ${id} berhasil dihapus`
  });
});

app.listen(PORT, () => {
  console.log(`Server CRUD API berjalan di http://localhost:${PORT}`);
});