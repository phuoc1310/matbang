// service.js
import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = 3033;

app.use(cors());
app.use(express.json());
app.get("/api/ads", async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 20), 50);
    const offset = (page - 1) * limit;
    const q = req.query.q || "";
    const city = req.query.city || ""; // Nhận tham số 'city' từ frontend (hcm, hn, dn, bd)

    console.log(`Fetching ads for city: ${city}, keyword: ${q}`);

    // 🔥 QUAN TRỌNG: Ánh xạ mã thành phố của bạn sang region_v2 của Chợ Tốt
    const regionMap = {
      'hcm': '13000', // TP.HCM
      'hn': '12000',  // Hà Nội
      'dn': '15000',  // Đà Nẵng
      'bd': '11000'   // Bình Dương
    };
    const regionCode = regionMap[city] || ''; // Lấy mã vùng, nếu không có thì để rỗng (lấy toàn quốc)

    // Xây dựng URL gọi API Chợ Tốt
    let url = `https://gateway.chotot.com/v1/public/ad-listing` +
      `?cg=1000` + // Mặt bằng, văn phòng
      `&limit=${limit}` +
      `&offset=${offset}` +
      `&st=s,k`;

    // 🔥 THÊM ĐIỀU KIỆN LỌC THEO VÙNG NẾU CÓ
    if (regionCode) {
      url += `&region_v2=${regionCode}`;
      console.log(`Filtering by region_v2: ${regionCode} for city: ${city}`);
    }

    // Thêm từ khóa tìm kiếm nếu có
    if (q.trim()) {
      url += `&q=${encodeURIComponent(q)}`;
    }

    console.log("Final URL to fetch:", url);

    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const json = await r.json();
    // Trả về kết quả
    res.json({ ads: json.ads || [] });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});
// ✅ DETAIL DÙNG list_id
app.get("/api/ads/:listId", async (req, res) => {
  const { listId } = req.params;

  const url =
    `https://gateway.chotot.com/v1/public/ad-listing?list_id=${listId}&cg=1000`;

  const r = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  const json = await r.json();
  const item = json.ads?.[0];
  if (!item) return res.status(404).json({ error: "Not found" });

  res.json(item);
});

app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/trangchu.html`);
});