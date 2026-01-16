@extends('layouts.app')

@section('content')
<div class="min-h-[70vh] flex items-center justify-center px-4">
    <div class="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">

        <h1 class="text-2xl font-bold text-center mb-6">
            Đăng nhập
        </h1>

        @if ($errors->any())
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <ul class="list-disc list-inside text-red-600 dark:text-red-400 text-sm">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        @if (session('success'))
            <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                <p class="text-green-600 dark:text-green-400 text-sm">{{ session('success') }}</p>
            </div>
        @endif

        <form method="POST" action="{{ route('login.post') }}" class="space-y-4">
            @csrf

            <div>
                <label class="block text-sm font-semibold mb-1">Email</label>
                <input type="email" name="email" value="{{ old('email') }}"
                       class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                              bg-slate-50 dark:bg-slate-800 
                              focus:ring-2 focus:ring-blue-500 focus:outline-none
                              text-gray-900 dark:text-gray-100"
                       required>
            </div>

            <div>
                <label class="block text-sm font-semibold mb-1">Mật khẩu</label>
                <input type="password" name="password"
                       class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                              bg-slate-50 dark:bg-slate-800 
                              focus:ring-2 focus:ring-blue-500 focus:outline-none
                              text-gray-900 dark:text-gray-100"
                       required>
            </div>

            <button type="submit"
                    class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg 
                           transition duration-200 shadow-lg flex items-center justify-center gap-2">
                <span class="material-symbols-outlined">login</span>
                Đăng nhập
            </button>
        </form>

    </div>
</div>
@endsection

