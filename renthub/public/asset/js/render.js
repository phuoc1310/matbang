function renderList(data) {
  const container = document.getElementById("listing");
  if (!container) return;

  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-10">
        <span class="material-symbols-outlined text-6xl text-gray-300">search_off</span>
        <p class="mt-2 text-gray-500">Không tìm thấy kết quả phù hợp</p>
      </div>`;
    return;
  }

  data.forEach(item => {
    // Format giá tiền
    const formattedPrice = new Intl.NumberFormat('vi-VN').format(item.price);

    const card = document.createElement("a");
    // Link tới trang chi tiết với ID sản phẩm
    card.href = `chitet.html?id=${item.id}`;
    card.className = "group flex flex-col bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden hover:shadow-lg transition-shadow cursor-pointer";

    card.innerHTML = `
    <div class="relative aspect-[4/3] overflow-hidden bg-gray-100">
      <img src="${item.image}" alt="${item.title}"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
    </div>

    <div class="p-4 flex flex-col flex-1">
      <h3 class="font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">
        ${item.title}
      </h3>

      <p class="text-sm text-slate-500 flex items-center gap-1 truncate">
        <span class="material-symbols-outlined text-sm">location_on</span>
        ${item.street}, ${item.ward}, ${item.district}
      </p>

      <div class="mt-auto flex items-center justify-between border-t pt-3">
        <div>
          <p class="text-xs text-slate-400">Giá</p>
          <p class="text-lg font-bold text-primary">
            ${item.price_string || "Liên hệ"}
          </p>
        </div>
        <div class="text-right">
          <p class="text-xs text-slate-400">Diện tích</p>
          <p class="text-sm font-bold">${item.area_m2} m²</p>
        </div>
      </div>
    </div>
  `;

    console.log("ITEM ID:", item.id);

    container.appendChild(card);
  });
}

function renderPage() {
  // Cập nhật text số lượng kết quả (nếu có element)
  const countEl = document.querySelector("h2 span.text-primary"); // Ví dụ selector
  // Logic phân trang giữ nguyên như cũ
  const start = (window.currentPage - 1) * window.PAGE_SIZE;
  const end = start + window.PAGE_SIZE;
  const pageData = window.filteredData.slice(start, end);

  renderList(pageData);
  renderPagination();
}
function renderPagination() {
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const container = document.querySelector(".pagination");
  if (!container || totalPages <= 1) {
    if (container) container.innerHTML = "";
    return;
  }

  // phần còn lại giữ nguyên

  container.innerHTML = "";

  // Prev
  rememberBtn("‹", currentPage > 1, () => {
    currentPage--;
    renderPage();
  });

  // Pages
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className =
      "size-10 rounded-lg " +
      (i === currentPage
        ? "bg-primary text-white font-bold"
        : "hover:bg-slate-100");

    btn.onclick = () => {
      currentPage = i;
      renderPage();
    };

    container.appendChild(btn);
  }

  // Next
  rememberBtn("›", currentPage < totalPages, () => {
    currentPage++;
    renderPage();
  });
}

function rememberBtn(text, enabled, action) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.className =
    "size-10 rounded-lg hover:bg-slate-100";
  btn.disabled = !enabled;
  btn.onclick = action;
  document.querySelector(".pagination").appendChild(btn);
}

function renderItem(item) {
  return `
    <a href="chitet.html?id=${item.ad_id}" class="block bg-white rounded-xl shadow hover:shadow-lg transition">
      <img src="${item.image}" class="w-full h-48 object-cover rounded-t-xl">
      <div class="p-4">
        <h3 class="font-bold line-clamp-2">${item.title}</h3>
        <p class="text-primary font-bold">
          ${item.price_string || "Liên hệ"}
        </p>
      </div>
    </a>
  `;
}
