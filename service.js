// service.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync("./key_firebase/serviceAccountKey.json", "utf8")
);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

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

app.post("/api/notify/daily", async (req, res) => {
  const userSnap = await db
    .collection("users")
    .where("role", "!=", "admin")
    .get();

  const users = userSnap.docs
    .map(doc => {
      const d = doc.data();
      if (!d.email) return null;
      return {
        to_email: d.email,
        name: d.displayName || d.name || "bạn",
      };
    })
    .filter(Boolean);


  const adsRes = await fetch(
    "http://localhost:3033/api/ads?page=1&limit=5",
    { headers: { "User-Agent": "Mozilla/5.0" } }
  );

  const adsJson = await adsRes.json();
  const products = adsJson.ads || [];

  const productHtml = products.map(p => `
  <li>
    <b>${p.subject || "Không tiêu đề"}</b><br/>
    Giá: ${p.price_string || "Thoả thuận"}<br/>
    Khu vực: ${p.area_name || ""}, ${p.region_name || ""}
  </li>
`).join("");
  res.json({
    subject: "Thông báo BI hằng ngày - SpaceHub",
    users,
    products, // để debug nếu cần
    email_content: `
    <h3>Xin chào,</h3>
    <p>Dưới đây là các mặt bằng mới hôm nay:</p>
    <ul>${productHtml}</ul>
    <p>Thời gian: ${new Date().toLocaleString("vi-VN")}</p>
    <p>SpaceHub BI System</p>
  `
  });


});


app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/trangchu.html");
});
