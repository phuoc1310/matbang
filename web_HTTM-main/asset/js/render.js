function renderList(data) {
  const container = document.getElementById("listing");
  if (!container) return;

  container.innerHTML = "";

  if (!data.length) {
    container.innerHTML = "<p>Không có kết quả</p>";
    return;
  }

  data.forEach(item => {
    const card = document.createElement("a");
    card.href = `chitet.html?id=${item.id}`;

    // ================== LOG VIEW EVENT ==================
    card.addEventListener("click", () => {
      // TODO: Superset dùng dữ liệu này để phân tích top listing
      logEventToN8N("VIEW_LISTING", {
        id: item.id,
        price: item.price,
        area: item.area_m2,
        district: item.district,
        region: item.region
      });
    });

    card.innerHTML = `
      <div>
        <img src="${item.image}">
        <h3>${item.title}</h3>
        <p>${item.price_string}</p>
      </div>
    `;
    container.appendChild(card);
  });
}
