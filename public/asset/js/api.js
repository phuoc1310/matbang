// public/asset/js/api.js
import { scoreListing } from "./bi/scoring.js";

function normalizeChoTotItem(item) {
  // Luôn đảm bảo có ít nhất một ảnh
  let images = ["https://placehold.co/600x400?text=RentalSpace"];
  
  // Thử các trường phổ biến
  const possibleImageFields = [
    item.image,
    item.thumbnail,
    item.thumbnail_url,
    item.image_url,
    item.images?.[0],
    item.image_thumbnails?.[0]?.image,
    item.image_thumbnails?.[0]?.thumbnail
  ];
  
  for (const img of possibleImageFields) {
    if (img && typeof img === 'string' && img.startsWith('http')) {
      images = [img];
      break;
    }
  }
  
  return {
    id: String(item.list_id || item.ad_id || item.id || Math.random()),
    ad_id: String(item.ad_id || item.list_id || item.id || Math.random()),
    title: item.subject || item.title || "Không có tiêu đề",
    images,
    image: images[0],
    price: Number(item.price) || 0,
    price_string: item.price_string || item.price_value || "Thỏa thuận",
    area_m2: Number(item.size || item.area || item.square) || 0,
    district: item.area_name || item.district || "",
    ward: item.ward_name || item.ward || "",
    region: item.region_name || item.city_name || item.region || "",
    street: item.street_name || item.street || "",
    address: [item.street_name, item.ward_name, item.area_name, item.region_name]
      .filter(Boolean).join(", "),
    seller: item.seller_info?.full_name || item.owner_info?.full_name || item.account_info?.full_name || "Chính chủ",
    rating: item.seller_info?.rating_score || item.rating || 0,
    lat: item.latitude,
    lng: item.longitude,
    date: item.date || item.created_at || item.list_time,
    category: item.category_name || item.category,
  };
}


function attachLevel(data) {
  // giả lập stats, mày có thể tính thật sau
  const stats = {
    minPrice: 0,
    maxPrice: 20000000000,
    minArea: 0,
    maxArea: 500,
    maxInterest: 100,
  };

  return data.map(item => {
    const { score } = scoreListing({
      id: item.id,
      price: item.price,
      area: item.area_m2,
      rating: item.rating,
      interests: item.interests || 0
    }, stats);

    let level = "Bình thường";
    if (score >= 0.7) level = "Ưu tiên cao";
    else if (score >= 0.4) level = "Theo dõi";

    return { ...item, score, level };
  });
}

export async function fetchAllData(pages = 20, keyword = "") {
  console.log(`Fetching ${pages} pages with keyword: "${keyword}"`);

  let all = [];

  const promises = [];
  for (let p = 1; p <= pages; p++) {
    promises.push(
      fetch(`/api/ads?page=${p}&q=${keyword}`)
        .then(res => res.json())
        .then(json => extractList(json))
    );
  }

  const results = await Promise.all(promises);
  results.forEach(list => all.push(...list));

  const uniqueAds = Array.from(
    new Map(all.map(item => [String(item.ad_id), item])).values()
  );
let normalized = uniqueAds.map(item => normalizeChoTotItem(item));

  // ✅ RANDOM CHỈ CHO TRANG CHỦ
  if (location.pathname.includes("Trangchu")) {
    normalized = normalized.sort(() => Math.random() - 0.5);
    console.log("🔀 Randomized homepage listings");
  }

  window.rawData = uniqueAds.map(item =>
    normalizeChoTotItem(item)
  );


  window.filteredData = [...window.rawData];
  return window.rawData;
}


export async function fetchDetail(id) {
  const r = await fetch(`/api/ads/${id}`);
  if (!r.ok) return null;

  const item = await r.json();

  // 🔥 QUAN TRỌNG: normalize giống list
  return normalizeChoTotItem(item);
}

function extractList(json) {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json.data)) return json.data;
  if (Array.isArray(json.ads)) return json.ads;
  return [];
}