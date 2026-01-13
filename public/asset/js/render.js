
// public/asset/js/render.js

function renderPagination() {
  const pagEl = document.querySelector(".pagination");
  if (!pagEl) return;

  const totalPages = Math.max(
    1,
    Math.ceil((window.filteredData?.length || 0) / (window.PAGE_SIZE || 1))
  );

  // bạn muốn hiện 1..10
  const maxShow = 10;
  const showPages = Math.min(totalPages, maxShow);

  pagEl.innerHTML = "";

  for (let p = 1; p <= showPages; p++) {
    const active = p === window.currentPage;

    const btn = document.createElement("button");
    btn.textContent = p;

    btn.className =
      "px-3 py-2 rounded-lg border text-sm font-bold transition " +
      (active
        ? "bg-primary text-white border-primary"
        : "bg-white hover:bg-slate-100 border-slate-200");

    btn.addEventListener("click", () => {
      window.currentPage = p;
      renderPage();
    });

    pagEl.appendChild(btn);
  }
}

function renderPage() {
  const listEl = document.getElementById("listing");
  if (!listEl) return;

  listEl.innerHTML = "";

  const start = (window.currentPage - 1) * window.PAGE_SIZE;
  const end = start + window.PAGE_SIZE;

  (window.filteredData || []).slice(start, end).forEach(item => {
    listEl.innerHTML += `
  <a href="chitiet.html?id=${item.id}" class="block border rounded-xl p-4 hover:shadow">
    <img src="${item.image}" class="w-full h-40 object-cover rounded">
    <h3 class="font-bold mt-2">${item.title}</h3>
    <p>${item.price_string}</p>
    <p>${item.region}</p>
  </a>
`;

  });

  // render pagination sau khi render list
  renderPagination();
}



function renderImages(item) {
  const gallery = document.getElementById("mainImage");
  if (!gallery) return;

  gallery.className =
    "w-full h-[420px] rounded-xl overflow-hidden bg-gray-100";
  gallery.innerHTML = "";

  const img =
    item.image ||
    item.thumbnail_image ||
    "";

  if (!img) {
    gallery.innerHTML = `
      <div class="w-full h-full flex items-center justify-center text-gray-400">
        Không có ảnh
      </div>`;
    return;
  }

  gallery.innerHTML = `
    <img
      src="${img}"
      class="w-full h-full object-cover"
      alt="Ảnh mặt bằng"
    />
  `;
}

export { renderPage, renderPagination, renderImages };
