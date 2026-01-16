<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| TRANG CHỦ
|--------------------------------------------------------------------------
*/
Route::get('/', [PropertyController::class, 'indexView'])->name('home');

/*
|--------------------------------------------------------------------------
| TÌM KIẾM
|--------------------------------------------------------------------------
*/
Route::get('/timkiem', [PropertyController::class, 'search'])->name('timkiem');

/*
|--------------------------------------------------------------------------
| CHI TIẾT TIN
|--------------------------------------------------------------------------
*/
Route::get('/chitiet/{id}', [PropertyController::class, 'detail'])->name('property.detail');

/*
|--------------------------------------------------------------------------
| ĐĂNG TIN (NGƯỜI DÙNG) - KHÔNG CẦN ĐĂNG NHẬP
|--------------------------------------------------------------------------
*/
Route::get('/dang-tin', [PropertyController::class, 'create'])->name('property.create');
Route::post('/dang-tin', [PropertyController::class, 'store'])->name('property.store');

/*
|--------------------------------------------------------------------------
| QUẢN LÝ TIN ĐĂNG (YÊU CẦU ĐĂNG NHẬP)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get('/quan-ly-tin', [PropertyController::class, 'manage'])
        ->name('property.manage');

    Route::get('/property/edit/{id}', [PropertyController::class, 'edit'])
        ->name('property.edit');

    Route::put('/property/update/{id}', [PropertyController::class, 'update'])
        ->name('property.update');

    Route::delete('/property/delete/{id}', [PropertyController::class, 'destroy'])
        ->name('property.delete');

    Route::post('/property/toggle/{id}', [PropertyController::class, 'toggle'])
        ->name('property.toggle');

    Route::get('/property/{id}/history', [PropertyController::class, 'history'])
        ->name('property.history');
});

Route::get('/thue-mat-bang', [PropertyController::class, 'list'])
    ->name('property.list');

/*
|--------------------------------------------------------------------------
| MENU TĨNH
|--------------------------------------------------------------------------
*/
Route::get('/cho-thue', [PropertyController::class, 'choThue'])->name('cho-thue');
Route::view('/du-an', 'pages.du-an');
Route::view('/tin-tuc', 'pages.tin-tuc');
Route::get('/dang-nhap', [AuthController::class, 'showLoginForm'])->name('login');
Route::post('/dang-nhap', [AuthController::class, 'login'])->name('login.post');
Route::post('/dang-xuat', [AuthController::class, 'logout'])->name('logout');

/*
|--------------------------------------------------------------------------
| ADMIN - QUẢN LÝ TRẠNG THÁI TIN ĐĂNG (YÊU CẦU ĐĂNG NHẬP)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {
    Route::get('/properties', [PropertyController::class, 'adminIndex'])
        ->name('properties');

    Route::post('/properties/{id}/approve', [PropertyController::class, 'approve'])
        ->name('properties.approve');

    Route::post('/properties/{id}/reject', [PropertyController::class, 'reject'])
        ->name('properties.reject');
});

/*
|--------------------------------------------------------------------------
| N8N WEBHOOK - TỰ ĐỘNG KIỂM DUYỆT
|--------------------------------------------------------------------------
*/
Route::post('/api/webhook/n8n', [WebhookController::class, 'handleN8n'])
    ->name('webhook.n8n');

Route::get('/api/webhook/pending-properties', [WebhookController::class, 'getPendingProperties'])
    ->name('webhook.pending-properties');
