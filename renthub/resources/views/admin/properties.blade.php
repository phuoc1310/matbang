@extends('layouts.app')

@section('content')
<div class="max-w-7xl mx-auto px-4 py-10">
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-text-main-light dark:text-text-main-dark mb-2">
            Quản lý trạng thái tin đăng
        </h1>
        <p class="text-text-sub-light dark:text-text-sub-dark">
            Phê duyệt hoặc từ chối các tin đăng của người dùng
        </p>
    </div>

    @if(session('success'))
        <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <p class="text-green-600 dark:text-green-400">{{ session('success') }}</p>
        </div>
    @endif

    <!-- Thống kê -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <a href="{{ route('admin.properties', ['status' => 'pending']) }}" 
           class="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-6 hover:shadow-lg transition">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-text-sub-light dark:text-text-sub-dark mb-1">Chờ duyệt</p>
                    <p class="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{{ $stats['pending'] }}</p>
                </div>
                <span class="material-symbols-outlined text-4xl text-yellow-600 dark:text-yellow-400">pending</span>
            </div>
        </a>

        <a href="{{ route('admin.properties', ['status' => 'approved']) }}" 
           class="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-6 hover:shadow-lg transition">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-text-sub-light dark:text-text-sub-dark mb-1">Đã duyệt</p>
                    <p class="text-3xl font-bold text-green-600 dark:text-green-400">{{ $stats['approved'] }}</p>
                </div>
                <span class="material-symbols-outlined text-4xl text-green-600 dark:text-green-400">check_circle</span>
            </div>
        </a>

        <a href="{{ route('admin.properties', ['status' => 'rejected']) }}" 
           class="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl p-6 hover:shadow-lg transition">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-text-sub-light dark:text-text-sub-dark mb-1">Đã từ chối</p>
                    <p class="text-3xl font-bold text-red-600 dark:text-red-400">{{ $stats['rejected'] }}</p>
                </div>
                <span class="material-symbols-outlined text-4xl text-red-600 dark:text-red-400">cancel</span>
            </div>
        </a>
    </div>

    <!-- Bộ lọc -->
    <div class="bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark p-4 mb-6">
        <div class="flex gap-3">
            <a href="{{ route('admin.properties', ['status' => 'pending']) }}"
               class="px-4 py-2 rounded-lg font-semibold {{ request('status') == 'pending' || !request('status') ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-slate-100 dark:bg-slate-800 text-text-sub-light dark:text-text-sub-dark' }}">
                Chờ duyệt
            </a>
            <a href="{{ route('admin.properties', ['status' => 'approved']) }}"
               class="px-4 py-2 rounded-lg font-semibold {{ request('status') == 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-text-sub-light dark:text-text-sub-dark' }}">
                Đã duyệt
            </a>
            <a href="{{ route('admin.properties', ['status' => 'rejected']) }}"
               class="px-4 py-2 rounded-lg font-semibold {{ request('status') == 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-text-sub-light dark:text-text-sub-dark' }}">
                Đã từ chối
            </a>
            <a href="{{ route('admin.properties') }}"
               class="px-4 py-2 rounded-lg font-semibold bg-slate-100 dark:bg-slate-800 text-text-sub-light dark:text-text-sub-dark">
                Tất cả
            </a>
        </div>
    </div>

    <!-- Danh sách tin đăng -->
    @if($properties->count() > 0)
        <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-lg border border-border-light dark:border-border-dark overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-slate-50 dark:bg-slate-800 border-b border-border-light dark:border-border-dark">
                        <tr>
                            <th class="px-6 py-4 text-left text-sm font-bold text-text-main-light dark:text-text-main-dark">ID</th>
                            <th class="px-6 py-4 text-left text-sm font-bold text-text-main-light dark:text-text-main-dark">Tiêu đề</th>
                            <th class="px-6 py-4 text-left text-sm font-bold text-text-main-light dark:text-text-main-dark">Người đăng</th>
                            <th class="px-6 py-4 text-left text-sm font-bold text-text-main-light dark:text-text-main-dark">Giá</th>
                            <th class="px-6 py-4 text-left text-sm font-bold text-text-main-light dark:text-text-main-dark">Trạng thái</th>
                            <th class="px-6 py-4 text-left text-sm font-bold text-text-main-light dark:text-text-main-dark">Ngày tạo</th>
                            <th class="px-6 py-4 text-left text-sm font-bold text-text-main-light dark:text-text-main-dark">Hành động</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-border-light dark:divide-border-dark">
                        @foreach($properties as $p)
                            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <td class="px-6 py-4 text-sm text-text-sub-light dark:text-text-sub-dark">#{{ $p->id }}</td>
                                <td class="px-6 py-4">
                                    <div class="max-w-xs">
                                        <a href="{{ route('property.detail', $p->id) }}" 
                                           class="text-sm font-semibold text-text-main-light dark:text-text-main-dark hover:text-primary">
                                            {{ Str::limit($p->title, 50) }}
                                        </a>
                                        <p class="text-xs text-text-sub-light dark:text-text-sub-dark mt-1">
                                            {{ Str::limit($p->address, 40) }}
                                        </p>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-sm text-text-sub-light dark:text-text-sub-dark">
                                    {{ $p->user->name ?? 'N/A' }}
                                </td>
                                <td class="px-6 py-4 text-sm font-bold text-primary">
                                    {{ number_format($p->price) }} đ
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
                                            Đã từ chối
                                        </span>
                                    @endif
                                </td>
                                <td class="px-6 py-4 text-sm text-text-sub-light dark:text-text-sub-dark">
                                    {{ $p->created_at->format('d/m/Y H:i') }}
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        @if($p->status == 'pending')
                                            <form method="POST" action="{{ route('admin.properties.approve', $p->id) }}" class="inline">
                                                @csrf
                                                <button type="submit"
                                                        class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-semibold transition">
                                                    Duyệt
                                                </button>
                                            </form>

                                            <button onclick="showRejectModal({{ $p->id }}, '{{ $p->title }}')"
                                                    class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-semibold transition">
                                                Từ chối
                                            </button>
                                        @endif

                                        <a href="{{ route('property.history', $p->id) }}"
                                           class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-semibold transition">
                                            Lịch sử
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            @if($properties->hasPages())
                <div class="px-6 py-4 border-t border-border-light dark:border-border-dark">
                    {{ $properties->links() }}
                </div>
            @endif
        </div>
    @else
        <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-lg border border-border-light dark:border-border-dark p-12 text-center">
            <span class="material-symbols-outlined text-6xl text-text-sub-light dark:text-text-sub-dark mb-4">inbox</span>
            <h3 class="text-xl font-bold text-text-main-light dark:text-text-main-dark mb-2">
                Không có tin đăng nào
            </h3>
            <p class="text-text-sub-light dark:text-text-sub-dark">
                Hiện tại không có tin đăng nào trong trạng thái này
            </p>
        </div>
    @endif
</div>

<!-- Modal từ chối -->
<div id="rejectModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
        <h3 class="text-xl font-bold text-text-main-light dark:text-text-main-dark mb-4">
            Từ chối tin đăng
        </h3>
        <p class="text-sm text-text-sub-light dark:text-text-sub-dark mb-4" id="modalTitle"></p>
        
        <form method="POST" action="" id="rejectForm">
            @csrf
            <div class="mb-4">
                <label class="block text-sm font-semibold text-text-main-light dark:text-text-main-dark mb-2">
                    Lý do từ chối <span class="text-red-500">*</span>
                </label>
                <textarea name="reason" 
                          rows="4" 
                          class="w-full px-4 py-3 rounded-xl border border-border-light dark:border-border-dark 
                                 bg-slate-50 dark:bg-slate-800 
                                 focus:ring-2 focus:ring-primary focus:outline-none
                                 text-text-main-light dark:text-text-main-dark"
                          placeholder="Nhập lý do từ chối tin đăng..."
                          required></textarea>
            </div>

            <div class="flex gap-3">
                <button type="submit"
                        class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-bold transition">
                    Xác nhận từ chối
                </button>
                <button type="button"
                        onclick="hideRejectModal()"
                        class="px-6 py-2 border border-border-light dark:border-border-dark rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                    Hủy
                </button>
            </div>
        </form>
    </div>
</div>

<script>
function showRejectModal(propertyId, title) {
    document.getElementById('modalTitle').textContent = 'Tin đăng: ' + title;
    document.getElementById('rejectForm').action = '{{ url("/admin/properties") }}/' + propertyId + '/reject';
    document.getElementById('rejectModal').classList.remove('hidden');
}

function hideRejectModal() {
    document.getElementById('rejectModal').classList.add('hidden');
    document.getElementById('rejectForm').reset();
}

// Đóng modal khi click outside
document.getElementById('rejectModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        hideRejectModal();
    }
});
</script>
@endsection
