@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto px-4 py-10">
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-text-main-light dark:text-text-main-dark mb-2">
            Cho thuê mặt bằng
        </h1>
        <p class="text-text-sub-light dark:text-text-sub-dark">
            Danh sách các mặt bằng đang cho thuê
        </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        @forelse($properties as $p)
            <div class="bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark overflow-hidden hover:shadow-xl transition-shadow">
                @if($p->images && count($p->images) > 0)
                <a href="{{ route('property.detail', $p->id) }}" class="block relative h-48 w-full overflow-hidden">
                    <img src="{{ $p->images[0] }}" 
                         alt="{{ $p->title }}" 
                         class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                    <div class="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                        {{ count($p->images) }} ảnh
                    </div>
                </a>
                @else
                <a href="{{ route('property.detail', $p->id) }}" class="block relative h-48 w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span class="material-symbols-outlined text-4xl text-gray-400">image</span>
                </a>
                @endif
                
                <div class="p-6">
                    <a href="{{ route('property.detail', $p->id) }}" class="block">
                        <h3 class="font-bold text-lg mb-2 text-text-main-light dark:text-text-main-dark hover:text-primary transition-colors">
                            {{ $p->title }}
                        </h3>
                    </a>
                
                <div class="mb-3">
                    <span class="text-primary font-bold text-xl">
                        {{ number_format($p->price) }} đ
                    </span>
                    <span class="text-sm text-text-sub-light dark:text-text-sub-dark">/tháng</span>
                </div>

                <div class="flex items-center gap-2 mb-3 text-sm text-text-sub-light dark:text-text-sub-dark">
                    <span class="material-symbols-outlined text-lg">location_on</span>
                    <span>{{ $p->address }}</span>
                </div>

                @if($p->area)
                <div class="flex items-center gap-2 mb-3 text-sm text-text-sub-light dark:text-text-sub-dark">
                    <span class="material-symbols-outlined text-lg">square_foot</span>
                    <span>{{ number_format($p->area, 1) }} m²</span>
                </div>
                @endif

                <div class="mb-4">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold 
                        @if($p->type == 'Văn phòng') bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400
                        @elseif($p->type == 'Cửa hàng') bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400
                        @else bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400
                        @endif">
                        {{ $p->type }}
                    </span>
                </div>

                    <a href="{{ route('property.detail', $p->id) }}"
                       class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors cursor-pointer">
                        <span>Xem chi tiết</span>
                        <span class="material-symbols-outlined text-lg">arrow_forward</span>
                    </a>
                </div>
            </div>
        @empty
            <div class="col-span-full bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark p-12 text-center">
                <span class="material-symbols-outlined text-6xl text-text-sub-light dark:text-text-sub-dark mb-4">inbox</span>
                <h3 class="text-xl font-bold text-text-main-light dark:text-text-main-dark mb-2">
                    Chưa có tin đăng nào
                </h3>
                <p class="text-text-sub-light dark:text-text-sub-dark mb-6">
                    Hiện tại chưa có mặt bằng nào đang cho thuê
                </p>
                <a href="{{ route('property.create') }}"
                   class="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-colors shadow-lg">
                    <span class="material-symbols-outlined">add_circle</span>
                    Đăng tin miễn phí
                </a>
            </div>
        @endforelse
    </div>

    @if($properties->hasPages())
        <div class="mt-8">
            {{ $properties->links() }}
        </div>
    @endif
</div>
@endsection
