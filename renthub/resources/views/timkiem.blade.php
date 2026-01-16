<!DOCTYPE html>

<html lang="vi" class="light">
<head>
    <meta charset="UTF-8">
    <title>Kết quả tìm kiếm - SpaceRent</title>

```
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
```

</head>

<body class="font-display bg-slate-100 min-h-screen">

<!-- ===== HEADER ===== -->

<header class="bg-white border-b sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
        <a href="/" class="flex items-center gap-2 font-bold text-xl text-primary">
            <span class="material-symbols-outlined">domain</span>
            SpaceRent
        </a>

```
    <div class="flex gap-3">
        <a href="/dang-nhap" class="px-4 py-2 border rounded-lg font-bold">Đăng nhập</a>
        <a href="/dang-tin" class="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">
            Đăng tin miễn phí
        </a>
    </div>
</div>
```

</header>

<!-- ===== CONTENT ===== -->

<main class="max-w-7xl mx-auto px-4 py-10">

```
<h1 class="text-3xl font-extrabold mb-6">
    Kết quả tìm kiếm
</h1>

<!-- ===== KHÔNG CÓ KẾT QUẢ ===== -->
@if($properties->isEmpty())
    <div class="bg-white rounded-xl p-10 text-center shadow">
        <p class="text-lg font-semibold mb-2">Không tìm thấy mặt bằng phù hợp</p>
        <p class="text-slate-500">Hãy thử thay đổi bộ lọc hoặc từ khóa</p>

        <a href="/" class="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold">
            Quay về trang chủ
        </a>
    </div>
@else

<!-- ===== DANH SÁCH ===== -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

    @foreach($properties as $p)
        <div class="bg-white rounded-2xl shadow hover:shadow-lg transition p-5">
            <div class="h-40 bg-slate-200 rounded-xl mb-4 flex items-center justify-center text-slate-400">
                <span class="material-symbols-outlined text-5xl">photo</span>
            </div>

            <h2 class="font-bold text-lg mb-2">
                {{ $p->title }}
            </h2>

            <div class="text-sm text-slate-600 space-y-1">
                <p>Loại: <b>{{ $p->type }}</b></p>
                <p>Diện tích: <b>{{ $p->area }} m²</b></p>
                <p class="text-blue-600 font-bold">
                    {{ number_format($p->price) }} đ
                </p>
            </div>

            <a href="/chitiet/{{ $p->id }}"
               class="block mt-4 text-center px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">
                Xem chi tiết
            </a>
        </div>
    @endforeach

</div>

    <!-- Pagination -->
    @if($properties->hasPages())
        <div class="mt-8 flex justify-center">
            {{ $properties->links() }}
        </div>
    @endif

@endif
```

</main>

<!-- ===== FOOTER ===== -->

<footer class="mt-16 py-8 text-center text-sm text-slate-500">
    © 2024 SpaceRent
</footer>

</body>
</html>
