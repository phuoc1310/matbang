// service.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import fs from "fs";

// =====================
// 🔐 FIREBASE
// =====================
const serviceAccount = JSON.parse(
  fs.readFileSync("./key_firebase/serviceAccountKey.json", "utf8")
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

// =====================
// 🚀 EXPRESS APP (DUY NHẤT)
// =====================
const app = express();
const PORT = 3033;

app.use(cors({
  origin: [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:3033",
  ],
}));
app.use(express.json());
app.use(express.static("public"));

// ===================================================
// 🏢 CHỢ TỐT – ADS LIST
// ===================================================
app.get("/api/ads", async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 20), 50);
    const offset = (page - 1) * limit;
    const q = req.query.q || "";
    const city = req.query.city || "";

    const regionMap = {
      hcm: "13000",
      hn: "12000",
      dn: "15000",
      bd: "11000",
    };
    const regionCode = regionMap[city] || "";

    let url =
      `https://gateway.chotot.com/v1/public/ad-listing` +
      `?cg=1000&limit=${limit}&offset=${offset}&st=s,k`;

    if (regionCode) url += `&region_v2=${regionCode}`;
    if (q.trim()) url += `&q=${encodeURIComponent(q)}`;

    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const json = await r.json();
    res.json({ ads: json.ads || [] });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// ===================================================
// 🧾 AD DETAIL
// ===================================================
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

// ===================================================
// 📊 SUPERSET – GUEST TOKEN
// ===================================================
const SUPERSET_URL = "http://localhost:8088";
const SUPERSET_ADMIN = "admin";
const SUPERSET_PASSWORD = "admin";

let accessToken = null;

async function loginSuperset() {
  const res = await fetch(`${SUPERSET_URL}/api/v1/security/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: SUPERSET_ADMIN,
      password: SUPERSET_PASSWORD,
      provider: "db",
      refresh: true,
    }),
  });

  const data = await res.json();
  accessToken = data.access_token;
  console.log("✅ Superset login OK");
}

app.get("/api/superset-token", async (req, res) => {
  try {
    if (!accessToken) await loginSuperset();

    const response = await fetch(
      `${SUPERSET_URL}/api/v1/security/guest_token/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          user: {
            username: "guest",
            first_name: "Guest",
            last_name: "User",
          },
          resources: [
            {
              type: "dashboard",
              id: "b33ee3f1-8e0f-4dc5-90b1-c501a631e072",
            },
          ],
          rls: [],
        }),
      }
    );

    const text = await response.text();

    res.json(JSON.parse(text));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Superset token error" });
  }
});


// ===================================================
// 🔔 DAILY NOTIFY
// ===================================================
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
    "http://localhost:3033/api/ads?page=1&limit=5"
  );
  const adsJson = await adsRes.json();

  res.json({
    subject: "Thông báo BI hằng ngày - SpaceHub",
    users,
    products: adsJson.ads || [],
  });
});

// ===================================================
// 🏠 ROOT
// ===================================================
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/trangchu.html");
});

// ===================================================
// ▶️ START SERVER (DUY NHẤT)
// ===================================================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
