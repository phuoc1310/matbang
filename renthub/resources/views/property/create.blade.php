@extends('layouts.app')

@section('content')
<div class="max-w-4xl mx-auto px-4 py-10">
    <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-lg border border-border-light dark:border-border-dark p-8">
        <h1 class="text-3xl font-bold mb-2 text-center text-primary">Đăng tin mặt bằng</h1>
        <p class="text-center text-text-sub-light dark:text-text-sub-dark mb-8">
            Điền thông tin chi tiết về mặt bằng của bạn
        </p>

        @if ($errors->any())
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <ul class="list-disc list-inside text-red-600 dark:text-red-400">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        @if (session('success'))
            <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                <p class="text-green-600 dark:text-green-400">{{ session('success') }}</p>
            </div>
        @endif

        <form method="POST" action="{{ route('property.store') }}" class="space-y-6">
            @csrf

            <div>
                <label class="font-semibold block mb-2 text-text-main-light dark:text-text-main-dark">
                    Tiêu đề <span class="text-red-500">*</span>
                </label>
                <input type="text" 
                       name="title" 
                       value="{{ old('title') }}"
                       class="w-full px-4 py-3 rounded-xl border border-border-light dark:border-border-dark 
                              bg-slate-50 dark:bg-slate-800 
                              focus:ring-2 focus:ring-primary focus:outline-none
                              text-text-main-light dark:text-text-main-dark"
                       placeholder="Ví dụ: Cho thuê mặt bằng văn phòng tại Quận 1"
                       required>
            </div>

            <div>
                <label class="font-semibold block mb-2 text-text-main-light dark:text-text-main-dark">
                    Loại hình <span class="text-red-500">*</span>
                </label>
                <select name="type" 
                        class="w-full px-4 py-3 rounded-xl border border-border-light dark:border-border-dark 
                               bg-slate-50 dark:bg-slate-800 
                               focus:ring-2 focus:ring-primary focus:outline-none
                               text-text-main-light dark:text-text-main-dark">
                    <option value="">-- Chọn loại hình --</option>
                    <option value="Đất" {{ old('type') == 'Đất' ? 'selected' : '' }}>Đất</option>
                    <option value="Văn phòng" {{ old('type') == 'Văn phòng' ? 'selected' : '' }}>Văn phòng</option>
                    <option value="Cửa hàng" {{ old('type') == 'Cửa hàng' ? 'selected' : '' }}>Cửa hàng</option>
                </select>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="font-semibold block mb-2 text-text-main-light dark:text-text-main-dark">
                        Giá (VND) <span class="text-red-500">*</span>
                    </label>
                    <input type="number" 
                           name="price" 
                           value="{{ old('price') }}"
                           min="0"
                           step="1000"
                           class="w-full px-4 py-3 rounded-xl border border-border-light dark:border-border-dark 
                                  bg-slate-50 dark:bg-slate-800 
                                  focus:ring-2 focus:ring-primary focus:outline-none
                                  text-text-main-light dark:text-text-main-dark"
                           placeholder="Ví dụ: 5000000"
                           required>
                    <p class="text-sm text-text-sub-light dark:text-text-sub-dark mt-1">
                        Nhập giá thuê/tháng
                    </p>
                </div>

                <div>
                    <label class="font-semibold block mb-2 text-text-main-light dark:text-text-main-dark">
                        Diện tích (m²)
                    </label>
                    <input type="number" 
                           name="area" 
                           value="{{ old('area') }}"
                           min="0"
                           step="0.1"
                           class="w-full px-4 py-3 rounded-xl border border-border-light dark:border-border-dark 
                                  bg-slate-50 dark:bg-slate-800 
                                  focus:ring-2 focus:ring-primary focus:outline-none
                                  text-text-main-light dark:text-text-main-dark"
                           placeholder="Ví dụ: 50">
                </div>
            </div>

            <div>
                <label class="font-semibold block mb-2 text-text-main-light dark:text-text-main-dark">
                    Địa chỉ <span class="text-red-500">*</span>
                </label>
                <input type="text" 
                       name="address" 
                       value="{{ old('address') }}"
                       class="w-full px-4 py-3 rounded-xl border border-border-light dark:border-border-dark 
                              bg-slate-50 dark:bg-slate-800 
                              focus:ring-2 focus:ring-primary focus:outline-none
                              text-text-main-light dark:text-text-main-dark"
                       placeholder="Ví dụ: 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh"
                       required>
            </div>

            <div>
                <label class="font-semibold block mb-2 text-text-main-light dark:text-text-main-dark">
                    Mô tả chi tiết <span class="text-red-500">*</span>
                </label>
                <textarea name="description" 
                          rows="6"
                          class="w-full px-4 py-3 rounded-xl border border-border-light dark:border-border-dark 
                                 bg-slate-50 dark:bg-slate-800 
                                 focus:ring-2 focus:ring-primary focus:outline-none
                                 text-text-main-light dark:text-text-main-dark"
                          placeholder="Nhập thông tin mô tả về mặt bằng (tiện ích, giao thông, phù hợp cho...)"
                          required>{{ old('description') }}</textarea>
                <p class="text-sm text-text-sub-light dark:text-text-sub-dark mt-1">
                    Mô tả chi tiết sẽ giúp thu hút người thuê hơn
                </p>
            </div>

            <div class="flex gap-4 pt-4">
                <button type="submit"
                        class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl 
                               font-bold transition duration-200 shadow-lg flex items-center justify-center gap-2
                               disabled:opacity-50 disabled:cursor-not-allowed">
                    <span class="material-symbols-outlined">check_circle</span>
                    Đăng tin ngay
                </button>
                <a href="{{ route('home') }}"
                   class="px-6 py-3 border border-gray-300 dark:border-gray-600 
                          rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 
                          transition duration-200 text-gray-700 dark:text-gray-300">
                    Hủy
                </a>
            </div>
        </form>
    </div>
</div>
@endsection