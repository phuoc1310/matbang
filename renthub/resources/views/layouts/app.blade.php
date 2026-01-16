<!DOCTYPE html>
<html class="light" lang="vi">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SpaceRent</title>

    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />

    <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
    <script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#137fec",
                        "primary-dark": "#0f66bd",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101922",
                        "surface-light": "#ffffff",
                        "surface-dark": "#1e2936",
                        "text-main-light": "#0d141b",
                        "text-main-dark": "#e2e8f0",
                        "text-sub-light": "#4c739a",
                        "text-sub-dark": "#94a3b8",
                        "border-light": "#e7edf3",
                        "border-dark": "#334155",
                    },
                    fontFamily: {
                        "display": ["Manrope", "sans-serif"]
                    },
                },
            },
        }
    </script>
</head>

<body class="bg-background-light font-display min-h-screen flex flex-col">

{{-- ===== HEADER ===== --}}
<header class="sticky top-0 z-50 bg-white border-b">
    <div class="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">

        <a href="/" class="flex items-center gap-2 font-bold text-xl">
            <span class="material-symbols-outlined text-blue-600">domain</span>
            SpaceRent
        </a>

        <nav class="hidden md:flex gap-6 font-semibold">
            <a href="/thue-mat-bang">Thuê mặt bằng</a>
            <a href="/cho-thue">Cho thuê</a>
            <a href="/du-an">Dự án</a>
            <a href="/tin-tuc">Tin tức</a>
        </nav>

        <div class="flex gap-3">
            @auth
                <a href="{{ route('property.manage') }}" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
                    Quản lý tin
                </a>
                <form method="POST" action="{{ route('logout') }}" class="inline">
                    @csrf
                    <button type="submit" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
                        Đăng xuất
                    </button>
                </form>
            @else
                <a href="{{ route('login') }}" class="px-4 py-2 border rounded-lg hover:bg-gray-50">Đăng nhập</a>
            @endauth
            <a href="{{ route('property.create') }}" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Đăng tin miễn phí
            </a>
        </div>
    </div>
</header>

{{-- ===== CONTENT ===== --}}
<main class="flex-grow">
    @yield('content')
</main>

{{-- ===== FOOTER ===== --}}
<footer class="border-t py-6 text-center text-sm text-gray-500">
    © 2024 SpaceRent
</footer>

</body>
</html>
