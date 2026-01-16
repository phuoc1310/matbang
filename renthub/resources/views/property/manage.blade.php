@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto px-4 py-10">
    <div class="flex justify-between items-center mb-8">
        <div>
            <h1 class="text-3xl font-bold text-text-main-light dark:text-text-main-dark">Quản lý tin đăng</h1>
            <p class="text-text-sub-light dark:text-text-sub-dark mt-1">
                Quản lý tất cả tin đăng mặt bằng của bạn
            </p>
        </div>

        <a href="{{ route('property.create') }}"
           class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl 
                  font-bold transition duration-200 shadow-lg">
            <span class="material-symbols-outlined">add_circle</span>
            Đăng tin mới
        </a>
    </div>

    @if(session('success'))
        <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <p class="text-green-600 dark:text-green-400">{{ session('success') }}</p>
        </div>
    @endif

    @if($properties->count() > 0)
        <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-lg border border-border-light dark:border-border-dark overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-slate-50 dark:bg-slate-800 border-b border-border-light dark:border-border-dark">
                        <tr>
                            <th class="px-6 py-4 text-left text-sm font-bold text-text-main-light dark:text-text-main-dark">ID</th>
                            <th class="px-6 py-4 text-left text-sm font-bold text-text-main-light dark:text-text-main-dark">Tiêu đề</th>
                            <th class="px-6 py-4 text-left text-sm font-bold text-text-main-light dark:text-text-main-dark">Giá</th>
                            <th class="px-6 py-4 text-left text-sm font-bold text-text-main-light dark:text-text-main-dark">Địa chỉ</th>
                            <th class="px-6 py-4 text-left text-sm font-bold text-text-main-light dark:text-text-main-dark">Trạng thái</th>
                            <th class="px-6 py-4 text-left text-sm font-bold text-text-main-light dark:text-text-main-dark">Hiển thị</th>
                            <th class="px-6 py-4 text-left text-sm font-bold text-text-main-light dark:text-text-main-dark">Hành động</th>
                        </tr>
                    </thead>

                    <tbody class="divide-y divide-border-light dark:divide-border-dark">
                        @foreach($properties as $p)
                            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <td class="px-6 py-4 text-sm text-text-sub-light dark:text-text-sub-dark">{{ $p->id }}</td>
                                <td class="px-6 py-4">
                                    <div class="text-sm font-semibold text-text-main-light dark:text-text-main-dark">
                                        {{ $p->title }}
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-sm font-bold text-blue-600 dark:text-blue-400">
                                    {{ number_format($p->price) }} đ
                                </td>
                                <td class="px-6 py-4 text-sm text-text-sub-light dark:text-text-sub-dark">
                                    {{ $p->address }}
                                </td>
                                <td class="px-6 py-4">
                                    @if($p->status == 'approved')
                                        <span class="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                            Đã duyệt
                                        </span>
                                    @elseif($p->status == 'pending')
                                        <span class="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                                            Chờ duyệt
                                        </span>
                                    @else
                                        <span class="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                            Từ chối
                                        </span>
                                    @endif
                                </td>
                                <td class="px-6 py-4">
                                    @if($p->is_visible)
                                        <span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                            Hiện
                                        </span>
                                    @else
                                        <span class="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400">
                                            Ẩn
                                        </span>
                                    @endif
                                </td>

                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <a href="{{ route('property.edit', $p->id) }}"
                                           class="px-3 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 
                                                  text-blue-700 dark:text-blue-400 rounded-lg font-semibold text-sm transition-colors">
                                            ✏️ Sửa
                                        </a>

                                        <a href="{{ route('property.history', $p->id) }}"
                                           class="px-3 py-1 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 
                                                  text-purple-700 dark:text-purple-400 rounded-lg font-semibold text-sm transition-colors">
                                            📜 Lịch sử
                                        </a>

                                        <form method="POST" action="{{ route('property.toggle', $p->id) }}" class="inline">
                                            @csrf
                                            <button type="submit"
                                                    class="px-3 py-1 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 
                                                           text-yellow-700 dark:text-yellow-400 rounded-lg font-semibold text-sm transition-colors">
                                                {{ $p->is_visible ? '👁️ Ẩn' : '👁️‍🗨️ Hiện' }}
                                            </button>
                                        </form>

                                        <form method="POST" action="{{ route('property.delete', $p->id) }}" class="inline"
                                              onsubmit="return confirm('Bạn có chắc chắn muốn xóa tin này?');">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit"
                                                    class="px-3 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 
                                                           text-red-700 dark:text-red-400 rounded-lg font-semibold text-sm transition-colors">
                                                🗑️ Xóa
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    @else
        <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-lg border border-border-light dark:border-border-dark p-12 text-center">
            <span class="material-symbols-outlined text-6xl text-text-sub-light dark:text-text-sub-dark mb-4">inbox</span>
            <h3 class="text-xl font-bold text-text-main-light dark:text-text-main-dark mb-2">
                Bạn chưa có tin đăng nào
            </h3>
            <p class="text-text-sub-light dark:text-text-sub-dark mb-6">
                Hãy bắt đầu đăng tin mặt bằng đầu tiên của bạn
            </p>
            <a href="{{ route('property.create') }}"
               class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl 
                      font-bold transition duration-200 shadow-lg">
                <span class="material-symbols-outlined">add_circle</span>
                Đăng tin mới
            </a>
        </div>
    @endif
</div>
@endsection
