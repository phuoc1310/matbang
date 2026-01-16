const API_URL = "";

function normalizeChoTotItem(item) {
  return {
    id: item.id || item.ad_id,
    title: item.title,
    image: item.image,
    price: Number(item.price) || 0,
    price_string: item.price_string,
    area_m2: Number(item.area_m2) || 0,
    district: item.district,
    region: item.region, 
    ward: item.ward,
    street: item.street,
    seller: item.seller,
    rating: item.rating ? Number(item.rating) : null,
    lat: item.lat,
    lng: item.lng,
    date: item.date,
    category: item.category,
    group: item.group
  };
}


async function fetchData() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    const normalized = data.map(normalizeChoTotItem);

    window.rawData = normalized;
    window.filteredData = [...normalized];

   return normalized;
   

  } catch (err) {
    console.error("Lỗi gọi API:", err);
    return [];
  }
}

