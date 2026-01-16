@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto px-4 py-10">
    <!-- Header -->
    <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
            <div>
                <h1 class="text-3xl font-bold text-text-main-light dark:text-text-main-dark mb-2">
                    Lịch sử chỉnh sửa
                </h1>
                <p class="text-text-sub-light dark:text-text-sub-dark">
                    Xem tất cả các thay đổi của tin đăng
                </p>
            </div>
            <a href="{{ route('property.manage') }}"
               class="px-4 py-2 border border-border-light dark:border-border-dark rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                Quay lại
            </a>
        </div>

        <!-- Thông tin tin đăng -->
        <div class="bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark p-6 mb-6">
            <h2 class="text-xl font-bold text-text-main-light dark:text-text-main-dark mb-2">
                {{ $property->title }}
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                    <span class="text-text-sub-light dark:text-text-sub-dark">Giá:</span>
                    <span class="font-bold text-blue-600 dark:text-blue-400 ml-2">{{ number_format($property->price) }} đ</span>
                </div>
                <div>
                    <span class="text-text-sub-light dark:text-text-sub-dark">Địa chỉ:</span>
                    <span class="font-semibold ml-2">{{ $property->address }}</span>
                </div>
                <div>
                    <span class="text-text-sub-light dark:text-text-sub-dark">Trạng thái:</span>
                    @if($property->status == 'approved')
                        <span class="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 ml-2">
                            Đã duyệt
                        </span>
                    @elseif($property->status == 'pending')
                        <span class="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 ml-2">
                            Chờ duyệt
                        </span>
                    @else
                        <span class="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 ml-2">
                            Đã từ chối
                        </span>
                    @endif
                </div>
            </div>
        </div>
    </div>

    @if($histories->count() > 0)
        <div class="space-y-4">
            @foreach($histories as $history)
                <div class="bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark p-6">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span class="material-symbols-outlined text-primary">history</span>
                            </div>
                            <div>
                                <p class="font-semibold text-text-main-light dark:text-text-main-dark">
                                    {{ $history->changedByUser->name ?? 'Hệ thống' }}
                                </p>
                                <p class="text-sm text-text-sub-light dark:text-text-sub-dark">
                                    {{ $history->created_at->format('d/m/Y H:i:s') }}
                                </p>
                            </div>
                        </div>
                        @if($history->reason)
                            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
                                <p class="text-sm text-blue-700 dark:text-blue-400 font-semibold">
                                    {{ $history->reason }}
                                </p>
                            </div>
                        @endif
                    </div>

                    <!-- Chi tiết thay đổi -->
                    @if($history->old_data && $history->new_data)
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <!-- Dữ liệu cũ -->
                            <div class="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                <h4 class="font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-lg">remove</span>
                                    Trước khi thay đổi
                                </h4>
                                <div class="space-y-2 text-sm">
                                    @if(isset($history->old_data['title']))
                                        <p><span class="font-semibold">Tiêu đề:</span> {{ $history->old_data['title'] }}</p>
                                    @endif
                                    @if(isset($history->old_data['price']))
                                        <p><span class="font-semibold">Giá:</span> {{ number_format($history->old_data['price']) }} đ</p>
                                    @endif
                                    @if(isset($history->old_data['status']))
                                        <p>
                                            <span class="font-semibold">Trạng thái:</span>
                                            <span class="ml-2 px-2 py-1 rounded text-xs
                                                @if($history->old_data['status'] == 'approved') bg-green-100 text-green-700
                                                @elseif($history->old_data['status'] == 'pending') bg-yellow-100 text-yellow-700
                                                @else bg-red-100 text-red-700
                                                @endif">
                                                {{ $history->old_data['status'] == 'approved' ? 'Đã duyệt' : ($history->old_data['status'] == 'pending' ? 'Chờ duyệt' : 'Đã từ chối') }}
                                            </span>
                                        </p>
                                    @endif
                                    @if(isset($history->old_data['address']))
                                        <p><span class="font-semibold">Địa chỉ:</span> {{ $history->old_data['address'] }}</p>
                                    @endif
                                </div>
                            </div>

                            <!-- Dữ liệu mới -->
                            <div class="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                <h4 class="font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-lg">add</span>
                                    Sau khi thay đổi
                                </h4>
                                <div class="space-y-2 text-sm">
                                    @if(isset($history->new_data['title']))
                                        <p><span class="font-semibold">Tiêu đề:</span> {{ $history->new_data['title'] }}</p>
                                    @endif
                                    @if(isset($history->new_data['price']))
                                        <p><span class="font-semibold">Giá:</span> {{ number_format($history->new_data['price']) }} đ</p>
                                    @endif
                                    @if(isset($history->new_data['status']))
                                        <p>
                                            <span class="font-semibold">Trạng thái:</span>
                                            <span class="ml-2 px-2 py-1 rounded text-xs
                                                @if($history->new_data['status'] == 'approved') bg-green-100 text-green-700
                                                @elseif($history->new_data['status'] == 'pending') bg-yellow-100 text-yellow-700
                                                @else bg-red-100 text-red-700
                                                @endif">
                                                {{ $history->new_data['status'] == 'approved' ? 'Đã duyệt' : ($history->new_data['status'] == 'pending' ? 'Chờ duyệt' : 'Đã từ chối') }}
                                            </span>
                                        </p>
                                    @endif
                                    @if(isset($history->new_data['address']))
                                        <p><span class="font-semibold">Địa chỉ:</span> {{ $history->new_data['address'] }}</p>
                                    @endif
                                </div>
                            </div>
                        </div>
                    @endif
                </div>
            @endforeach
        </div>
    @else
        <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-lg border border-border-light dark:border-border-dark p-12 text-center">
            <span class="material-symbols-outlined text-6xl text-text-sub-light dark:text-text-sub-dark mb-4">history</span>
            <h3 class="text-xl font-bold text-text-main-light dark:text-text-main-dark mb-2">
                Chưa có lịch sử chỉnh sửa
            </h3>
            <p class="text-text-sub-light dark:text-text-sub-dark">
                Tin đăng này chưa có thay đổi nào được ghi lại
            </p>
        </div>
    @endif
</div>
@endsection
