@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto px-4 py-10">
    <h1 class="text-2xl font-bold mb-6">Thuê mặt bằng</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        @forelse($properties as $p)
            <div class="bg-white shadow rounded-lg p-4">
                <h3 class="font-bold text-lg">{{ $p->title }}</h3>
                <p class="text-primary font-semibold">
                    {{ number_format($p->price) }} đ
                </p>
                <p class="text-sm text-gray-500">{{ $p->address }}</p>

                <a href="{{ route('property.detail', $p->id) }}"
                   class="inline-block mt-3 text-primary font-semibold">
                    Xem chi tiết →
                </a>
            </div>
        @empty
            <p>Chưa có tin đăng.</p>
        @endforelse
    </div>
</div>
@endsection
