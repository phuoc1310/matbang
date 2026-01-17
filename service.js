// service.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import pkg from "@payos/node";
const PayOS = pkg.PayOS || pkg.default?.PayOS || pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
// 💳 PAYOS CONFIG
// =====================
const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID;
const PAYOS_API_KEY = process.env.PAYOS_API_KEY;
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "http://localhost:3033";

let payos = null;
if (PAYOS_CLIENT_ID && PAYOS_API_KEY && PAYOS_CHECKSUM_KEY) {
  try {
    if (typeof PayOS !== "function") {
      console.error("❌ PayOS is not a constructor. Package structure:", Object.keys(pkg));
      throw new Error("PayOS is not a constructor");
    }
    payos = new PayOS(
      PAYOS_CLIENT_ID,
      PAYOS_API_KEY,
      PAYOS_CHECKSUM_KEY
    );
    console.log("✅ PayOS SDK initialized");
  } catch (error) {
    console.error("❌ Error initializing PayOS:", error.message);
  }
} else {
  console.warn("⚠️ Thieu PAYOS_CLIENT_ID / PAYOS_API_KEY / PAYOS_CHECKSUM_KEY trong .env");
}

// =====================
// 🚀 EXPRESS APP (DUY NHẤT)
// =====================
const app = express();
const PORT = 3033;

app.use(cors({
  origin: [
    "http://localhost:3033",
    "http://127.0.0.1:3033",
  ],
}));
app.use(express.json());

// ===================================================
// 📁 CẤU HÌNH UPLOAD FILE
// ===================================================
const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Created uploads directory");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Chi cho phep upload file anh (JPEG, JPG, PNG, GIF, WEBP)"));
    }
  },
});

console.log("✅ Multer configured, uploads directory:", uploadsDir);

// ===================================================
// 📤 UPLOAD IMAGES
// ===================================================
app.post("/api/upload", (req, res) => {
  upload.array("images", 10)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File qua lon. Kich thuoc toi da: 5MB' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ error: 'Qua nhieu file. Toi da: 10 file' });
        }
        return res.status(400).json({ error: err.message || 'Loi upload file' });
      }
      return res.status(400).json({ error: err.message || 'Loi upload file' });
    }

    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "Khong co file nao duoc upload" });
      }

      const urls = req.files.map((file) => `/uploads/${file.filename}`);
      
      res.json({
        success: true,
        urls: urls,
        message: `Da upload ${urls.length} anh thanh cong`,
      });
    } catch (error) {
      res.status(500).json({ error: error.message || "Loi upload file" });
    }
  });
});

// ===================================================
// 🔄 HANDLE /public/* PATH (for backward compatibility with old payment links)
// Must be before express.static to catch /public/* requests
// ===================================================
app.get("/public/*", (req, res) => {
  const filePath = req.path.replace("/public", "") || "/";
  const fullPath = path.join(__dirname, "public", filePath);
  res.sendFile(fullPath, (err) => {
    if (err) {
      res.status(404).send("File not found");
    }
  });
});

// ===================================================
// 👥 ADMIN - GET ALL USERS
// ===================================================
app.get("/api/admin/users", async (req, res) => {
  try {
    const userSnap = await db.collection("users").get();
    const users = userSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString()
      };
    });
    res.json({ success: true, users });
  } catch (error) {
    console.error("❌ Error /api/admin/users:", error.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ===================================================
// 👥 ADMIN - UPDATE USER
// ===================================================
app.put("/api/admin/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { fullName, phone, address, role } = req.body;
    
    await db.collection("users").doc(userId).update({
      fullName,
      phone,
      address,
      role
    });
    
    res.json({ success: true, message: "Cap nhat thanh cong" });
  } catch (error) {
    console.error("❌ Error /api/admin/users/:userId PUT:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================================================
// 👥 ADMIN - DELETE USER
// ===================================================
app.delete("/api/admin/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    const userData = userDoc.data();
    if (userData.role === 'admin') {
      return res.status(400).json({ success: false, message: "Khong the xoa admin" });
    }
    
    await db.collection("users").doc(userId).delete();
    
    res.json({ success: true, message: "Xoa thanh cong" });
  } catch (error) {
    console.error("❌ Error /api/admin/users/:userId DELETE:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================================================
// 🏢 LISTINGS - CRUD OPERATIONS
// ===================================================

async function saveListingHistory(listingId, oldData, newData, changedBy, reason = '') {
  if (!db) return;
  
  try {
    const changes = {};
    Object.keys(newData).forEach(key => {
      if (key !== 'updatedAt' && JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        changes[key] = {
          old: oldData[key],
          new: newData[key]
        };
      }
    });

    if (Object.keys(changes).length > 0) {
      const historyData = {
        listingId,
        oldData,
        newData,
        changes,
        userName: changedBy || 'system',
        reason: reason || 'Cap nhat thong tin',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      await db.collection("listingHistories").add(historyData);
    }
  } catch (error) {
    console.error("Error saving listing history:", error);
  }
}

app.post("/api/listings", async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: "Firebase chua duoc khoi tao. Vui long kiem tra serviceAccountKey.json" });
  }
  try {
    const {
      title,
      description,
      businessType,
      area,
      price,
      address,
      district,
      ward,
      region,
      images,
      userId,
      userName
    } = req.body;

    const missingFields = [];
    
    const titleStr = String(title || '').trim();
    if (!titleStr) {
      missingFields.push('Tieu de');
    }
    
    const businessTypeStr = String(businessType || '').trim();
    if (!businessTypeStr) {
      missingFields.push('Loai hinh kinh doanh');
    }
    
    const priceNum = typeof price === 'string' ? Number(price.trim()) : Number(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      missingFields.push('Gia thue (phai > 0)');
    }
    
    const addressStr = String(address || '').trim();
    if (!addressStr) {
      missingFields.push('Dia chi');
    }
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Thieu thong tin bat buoc: ${missingFields.join(', ')}` 
      });
    }

    const listingData = {
      title: String(title).trim(),
      description: description || "",
      businessType,
      area: Number(area) || 0,
      price: priceNum > 0 ? priceNum : 0,
      price_string: priceNum >= 1000000000 
        ? `${(priceNum / 1000000000).toFixed(1)} ty` 
        : `${(priceNum / 1000000).toFixed(0)} trieu`,
      address,
      district: district || "",
      ward: ward || "",
      region: region || "",
      images: Array.isArray(images) ? images : (images ? [images] : []),
      userId: userId || "",
      userName: userName || "Chinh chu",
      featured: false,
      status: "pending",
      isVisible: true,
      views: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection("listings").add(listingData);
    
    res.json({
      id: docRef.id,
      ...listingData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error creating listing:", error);
    res.status(500).json({ error: "Loi tao tin dang" });
  }
});

app.get("/api/listings", async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: "Firebase chua duoc khoi tao. Vui long kiem tra serviceAccountKey.json" });
  }
  try {
    const { 
      featured, 
      userId, 
      businessType,
      status,
      limit = 50 
    } = req.query;

    let query = db.collection("listings");

    if (featured === "true") {
      query = query.where("featured", "==", true);
    }

    if (userId) {
      query = query.where("userId", "==", userId);
    }

    if (businessType) {
      query = query.where("businessType", "==", businessType);
    }

    if (status) {
      query = query.where("status", "==", status);
    }

    let snapshot;
    try {
      snapshot = await query
        .orderBy("createdAt", "desc")
        .limit(Number(limit))
        .get();
    } catch (orderError) {
      console.warn("OrderBy error, trying without orderBy:", orderError.message);
      snapshot = await query
        .limit(Number(limit))
        .get();
    }

    const listings = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      listings.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString()
      });
    });

    res.json({ listings });
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ 
      error: "Loi lay danh sach tin dang",
      details: error.message
    });
  }
});

app.get("/api/listings/:id", async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: "Firebase chua duoc khoi tao. Vui long kiem tra serviceAccountKey.json" });
  }
  try {
    const { id } = req.params;
    const doc = await db.collection("listings").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Khong tim thay tin dang" });
    }

    const data = doc.data();
    res.json({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate()?.toISOString() || new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching listing:", error);
    res.status(500).json({ error: "Loi lay tin dang" });
  }
});

app.put("/api/listings/:id", async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: "Firebase chua duoc khoi tao. Vui long kiem tra serviceAccountKey.json" });
  }
  try {
    const { id } = req.params;
    const updateData = req.body;
    const changedBy = updateData.changedBy || req.headers['x-user-id'] || 'system';
    const reason = updateData.reason || 'Cap nhat thong tin';
    
    const docRef = db.collection("listings").doc(id);
    const oldDoc = await docRef.get();
    const oldData = oldDoc.exists ? oldDoc.data() : null;

    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.changedBy;

    if (updateData.price !== undefined) {
      const price = Number(updateData.price) || 0;
      updateData.price_string = price >= 1000000000 
        ? `${(price / 1000000000).toFixed(1)} ty` 
        : `${(price / 1000000).toFixed(0)} trieu`;
    }

    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await docRef.update(updateData);

    const newDoc = await docRef.get();
    const newData = newDoc.data();

    if (oldData) {
      await saveListingHistory(id, oldData, newData, changedBy, reason);
    }

    res.json({
      id: docRef.id,
      ...newData,
      createdAt: newData.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
      updatedAt: newData.updatedAt?.toDate()?.toISOString() || new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating listing:", error);
    res.status(500).json({ error: "Loi cap nhat tin dang" });
  }
});

app.delete("/api/listings/:id", async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: "Firebase chua duoc khoi tao. Vui long kiem tra serviceAccountKey.json" });
  }
  try {
    const { id } = req.params;
    await db.collection("listings").doc(id).delete();
    res.json({ success: true, message: "Da xoa tin dang" });
  } catch (error) {
    console.error("Error deleting listing:", error);
    res.status(500).json({ error: "Loi xoa tin dang" });
  }
});

app.patch("/api/listings/:id/toggle-visibility", async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: "Firebase chua duoc khoi tao. Vui long kiem tra serviceAccountKey.json" });
  }
  try {
    const { id } = req.params;
    const changedBy = req.headers['x-user-id'] || 'system';
    
    const docRef = db.collection("listings").doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: "Khong tim thay tin dang" });
    }

    const oldData = doc.data();
    const newIsVisible = !oldData.isVisible;

    await docRef.update({
      isVisible: newIsVisible,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const newDoc = await docRef.get();
    const newData = newDoc.data();

    await saveListingHistory(id, oldData, newData, changedBy, `Thay doi trang thai hien thi: ${newIsVisible ? 'Hien thi' : 'An'}`);

    res.json({
      id: docRef.id,
      ...newData,
      createdAt: newData.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
      updatedAt: newData.updatedAt?.toDate()?.toISOString() || new Date().toISOString()
    });
  } catch (error) {
    console.error("Error toggling visibility:", error);
    res.status(500).json({ error: "Loi thay doi trang thai hien thi" });
  }
});

app.patch("/api/listings/:id/status", async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: "Firebase chua duoc khoi tao. Vui long kiem tra serviceAccountKey.json" });
  }
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const changedBy = req.headers['x-user-id'] || 'system';

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "Trang thai khong hop le. Phai la: pending, approved, hoac rejected" });
    }

    const docRef = db.collection("listings").doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: "Khong tim thay tin dang" });
    }

    const oldData = doc.data();

    await docRef.update({
      status,
      isVisible: status === 'approved',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const newDoc = await docRef.get();
    const newData = newDoc.data();

    const statusLabels = {
      pending: 'Cho duyet',
      approved: 'Da duyet',
      rejected: 'Tu choi'
    };
    await saveListingHistory(id, oldData, newData, changedBy, reason || `Thay doi trang thai: ${statusLabels[status]}`);

    res.json({
      id: docRef.id,
      ...newData,
      createdAt: newData.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
      updatedAt: newData.updatedAt?.toDate()?.toISOString() || new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Loi cap nhat trang thai" });
  }
});

app.get("/api/listings/:id/history", async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: "Firebase chua duoc khoi tao. Vui long kiem tra serviceAccountKey.json" });
  }
  try {
    const { id } = req.params;
    const snapshot = await db.collection("listingHistories")
      .where("listingId", "==", id)
      .orderBy("createdAt", "desc")
      .get();

    const histories = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      histories.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString()
      });
    });

    res.json({ histories });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Loi lay lich su chinh sua" });
  }
});

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

  } catch (error) {
    console.error("❌ Error /api/ads:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ===================================================
// 🧾 AD DETAIL
// ===================================================
app.get("/api/ads/:listId", async (req, res) => {
  try {
    const { listId } = req.params;
    const url = `https://gateway.chotot.com/v1/public/ad-listing?list_id=${listId}&cg=1000`;
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const json = await r.json();
    const item = json.ads?.[0];
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (error) {
    console.error("❌ Error /api/ads/:listId:", error.message);
    res.status(500).json({ error: "Server error" });
  }
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

  } catch (error) {
    console.error("❌ Error /api/superset-token:", error.message);
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

// ===================================================
// 💳 PAYOS - CREATE PAYMENT LINK
// ===================================================
app.post("/api/create-payment-link", async (req, res) => {
  try {
    if (!payos) {
      return res.status(500).json({
        success: false,
        message: "PayOS chua duoc cau hinh. Vui long kiem tra .env",
      });
    }

    const { orderCode, amount, description, items } = req.body;

    if (!orderCode || !amount) {
      return res.status(400).json({
        success: false,
        message: "Thieu orderCode hoac amount",
      });
    }

    const returnUrl = `${FRONTEND_BASE_URL}/payos-success.html?orderCode=${orderCode}`;
    const cancelUrl = `${FRONTEND_BASE_URL}/payos-cancel.html?orderCode=${orderCode}`;

    const paymentItems = Array.isArray(items) && items.length > 0 
      ? items.map(item => ({
          name: item.name || "Goi VIP SpaceRent",
          quantity: parseInt(item.quantity) || 1,
          price: parseInt(item.price) || parseInt(amount),
        }))
      : [
          {
            name: "Goi VIP SpaceRent",
            quantity: 1,
            price: parseInt(amount),
          },
        ];

    const paymentLinkData = {
      orderCode: parseInt(orderCode),
      amount: parseInt(amount),
      description: description || "Thanh toan don hang SpaceRent",
      items: paymentItems,
      returnUrl,
      cancelUrl,
    };

    const paymentLink = await payos.createPaymentLink(paymentLinkData);

    res.json({
      success: true,
      data: {
        checkoutUrl: paymentLink.checkoutUrl,
        orderCode: paymentLink.orderCode,
        amount: paymentLink.amount,
        status: paymentLink.status,
      },
    });
  } catch (error) {
    console.error("❌ Error create_payment_link:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Loi tao payment link",
    });
  }
});

// ===================================================
// 💳 PAYOS - WEBHOOK
// ===================================================
app.post("/api/payos/webhook", async (req, res) => {
  try {
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error payos_webhook:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===================================================
// 🤖 GEMINI - CHATBOT API
// ===================================================
app.post("/api/chatbot/gemini", async (req, res) => {
  try {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here") {
      return res.status(500).json({
        success: false,
        message: "Gemini API Key chua duoc cau hinh trong .env",
      });
    }

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Thieu message",
      });
    }

    const systemPrompt = `Ban la tro ly AI than thien cua SpaceRent - nen tang ket noi khong gian kinh doanh hang dau Viet Nam.

Nhiem vu cua ban:
- Tra loi cac cau hoi ve tim kiem mat bang, dang tin cho thue, goi VIP
- Huong dan nguoi dung su dung website
- Tu van ve thue/cho thue mat bang
- Tra loi bang tieng Viet, ngan gon, than thien va huu ich

Thong tin ve SpaceRent:
- Goi VIP: 1 thang (99k), 3 thang (249k), 6 thang (449k), 12 thang (799k)
- Mien phi: Dang ky, dang tin, tim kiem, xem chi tiet
- Email ho tro: contact@spacerent.vn

Hay tra loi cau hoi cua nguoi dung mot cach tu nhien va huu ich.`;

    const fullPrompt = `${systemPrompt}\n\nNguoi dung hoi: ${message}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(500).json({
        success: false,
        message: `Gemini API error: ${errorData.error?.message || response.status}`,
      });
    }

    const result = await response.json();

    if (result.candidates && result.candidates[0]?.content) {
      const text = result.candidates[0].content.parts[0].text;
      return res.json({
        success: true,
        response: text.trim(),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Khong nhan duoc phan hoi tu Gemini API",
    });
  } catch (error) {
    console.error("❌ Error chatbot_gemini:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Loi goi Gemini API",
    });
  }
});

// ===================================================
// 🏠 ROOT
// ===================================================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Trangchu.html"));
});

// ===================================================
// ▶️ START SERVER (DUY NHẤT)
// ===================================================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
