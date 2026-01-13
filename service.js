// service.js
import express from "express";

import cors from "cors";

const app = express();

const PORT = 3033;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/api/ads", async (req, res) => {
  try {
    const region_v2 = req.query.region_v2 || 12000;

    // 👇 mặc định 100, nhưng bạn có thể gọi ?limit=100
    const limit = Math.min(Number(req.query.limit || 100), 100);
    const page = Math.max(Number(req.query.page || 1), 1);
    const offset = (page - 1) * limit;

    const url =
      `https://gateway.chotot.com/v1/public/ad-listing` +
      `?cg=1040&region_v2=${region_v2}&limit=${limit}&offset=${offset}`;

    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
    });

    if (!r.ok) {
      return res.status(r.status).json({ error: `ChoTot error ${r.status}` });
    }

    const json = await r.json();
    res.json({ ads: json.ads || [], page, limit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}/trangchu.html`);
});
