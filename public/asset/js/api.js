// public/asset/js/api.js

function normalizeChoTotItem(item) {
  return {
    id: item.ad_id,
    title: item.subject,
    image: item.thumbnail_image,
    price: Number(item.price) || 0,
    price_string: item.price_string,
    area_m2: Number(item.size) || 0,
    district: item.area_name,
    ward: item.ward_name_v3,
    region: item.region_name_v3,
    street: item.street_name,
    seller: item.seller_info?.full_name || "",
    rating: item.average_rating != null ? Number(item.average_rating) : null,
    lat: item.latitude,
    lng: item.longitude,
    date: item.date,
    category: item.category_name,
  };
}

// 👉 hàm bóc mảng an toàn
function extractList(json) {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json.data)) return json.data;
  if (Array.isArray(json.ads)) return json.ads;
  return [];
}


export async function fetchData(page = 1, region_v2 = 12000) {
  const res = await fetch(`/api/ads?page=${page}&region_v2=${region_v2}`);
  const json = await res.json();

  const list = extractList(json);

  window.rawData = list.map(normalizeChoTotItem);
  window.filteredData = [...window.rawData];

  return window.rawData;
}

export async function fetchAllData(pages = 10, region_v2 = 12000) {
  let all = [];

  for (let p = 1; p <= pages; p++) {
    const res = await fetch(`/api/ads?page=${p}&region_v2=${region_v2}`);
    const json = await res.json();
    const list = extractList(json);
    all.push(...list);
  }

  window.rawData = all.map(normalizeChoTotItem);
  window.filteredData = [...window.rawData];

  return window.rawData;
}
