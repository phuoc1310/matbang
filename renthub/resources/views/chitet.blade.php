<!DOCTYPE html>
<html class="light" lang="vi">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Trang chi tiết mặt bằng - RentHub</title>

    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>

    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&family=Noto+Sans:wght@100..900&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet"/>

    <script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        primary: "#137fec",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101922",
                        "surface-light": "#ffffff",
                        "surface-dark": "#1a2632",
                    },
                    fontFamily: {
                        display: ["Manrope", "sans-serif"],
                        body: ["Noto Sans", "sans-serif"],
                    },
                },
            },
        }
    </script>
</head>

<body class="bg-background-light dark:bg-background-dark font-display min-h-screen">

<header class="sticky top-0 bg-white border-b px-6 py-3">
    <div class="max-w-[1280px] mx-auto flex justify-between items-center">
        <a href="{{ url('/') }}" class="flex items-center gap-2 text-xl font-bold">
            RentHub
        </a>
    </div>
</header>

<main class="max-w-[1280px] mx-auto px-6 py-6">

    <!-- Breadcrumb -->
    <nav class="text-sm text-gray-500 mb-4">
        <a href="{{ url('/') }}" class="hover:text-primary">Trang chủ</a> /
        <span>Chi tiết</span>
    </nav>

    <!-- Image Gallery -->
    <section class="mb-6">
        @if($property->images && count($property->images) > 0)
            @if(count($property->images) == 1)
                <div class="w-full h-[400px] rounded-xl overflow-hidden">
                    <img src="{{ $property->images[0] }}" 
                         alt="{{ $property->title }}" 
                         class="w-full h-full object-cover">
                </div>
            @else
                <div class="grid grid-cols-4 gap-2 h-[400px]">
                    <div class="col-span-2 row-span-2">
                        <img src="{{ $property->images[0] }}" 
                             alt="{{ $property->title }}" 
                             class="w-full h-full object-cover rounded-l-xl">
                    </div>
                    @foreach(array_slice($property->images, 1, 4) as $index => $image)
                        <div class="{{ $index == 0 ? 'row-span-2' : '' }}">
                            <img src="{{ $image }}" 
                                 alt="{{ $property->title }} - Ảnh {{ $index + 2 }}" 
                                 class="w-full h-full object-cover {{ $index == 0 ? 'rounded-tr-xl' : 'rounded-r-xl' }}">
                        </div>
                    @endforeach
                </div>
            @endif
        @else
            <div class="w-full h-[400px] bg-slate-200 rounded-xl flex items-center justify-center">
                <span class="material-symbols-outlined text-6xl text-slate-400">photo</span>
            </div>
        @endif
    </section>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- LEFT -->
        <div class="lg:col-span-2">
            <h1 class="text-3xl font-bold mb-2 text-text-main-light dark:text-text-main-dark">
                {{ $property->title }}
            </h1>
            <p class="text-text-sub-light dark:text-text-sub-dark mb-4">
                <span class="material-symbols-outlined text-base align-middle">location_on</span>
                {{ $property->address }}
            </p>

            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                    <p class="text-sm text-text-sub-light dark:text-text-sub-dark mb-1">Diện tích</p>
                    <p class="text-lg font-bold text-text-main-light dark:text-text-main-dark">
                        {{ $property->area ? number_format($property->area, 1) : 'N/A' }} m²
                    </p>
                </div>
                <div class="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                    <p class="text-sm text-text-sub-light dark:text-text-sub-dark mb-1">Giá thuê/tháng</p>
                    <p class="text-lg font-bold text-primary">
                        {{ number_format($property->price) }} đ
                    </p>
                </div>
            </div>

            <div class="mb-4">
                <span class="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                    {{ $property->type }}
                </span>
            </div>

            <h3 class="font-bold mb-2 text-text-main-light dark:text-text-main-dark">Mô tả</h3>
            <p class="text-text-sub-light dark:text-text-sub-dark whitespace-pre-line">
                {{ $property->description }}
            </p>
        </div>

        <!-- RIGHT -->
        <aside class="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 h-fit sticky top-20">
            <p class="text-sm text-text-sub-light dark:text-text-sub-dark mb-1">Trạng thái</p>
            @if($property->status == 'approved')
                <span class="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 mb-4">
                    Đã duyệt
                </span>
            @elseif($property->status == 'pending')
                <span class="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 mb-4">
                    Chờ duyệt
                </span>
            @else
                <span class="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 mb-4">
                    Từ chối
                </span>
            @endif

            <button class="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold mt-4 transition duration-200 shadow-lg">
                <span class="material-symbols-outlined align-middle">call</span>
                Liên hệ
            </button>

            <a href="{{ route('home') }}" 
               class="block w-full text-center border border-border-light dark:border-border-dark py-3 rounded-xl font-semibold mt-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-200">
                Quay lại
            </a>
        </aside>
    </div>
</main>

<footer class="border-t py-6 text-center text-sm text-gray-500">
    © 2023 RentHub
</footer>


</body>
</html>
