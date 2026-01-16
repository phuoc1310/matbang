<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Tạo user mẫu để test
        User::factory()->create([
            'name' => 'Nguyễn Văn A',
            'email' => 'user@test.com',
            'password' => \Illuminate\Support\Facades\Hash::make('123456'),
        ]);

        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@test.com',
            'password' => \Illuminate\Support\Facades\Hash::make('123456'),
        ]);

        // Tạo 10 mặt bằng cho thuê với hình ảnh
        $this->call(PropertySeeder::class);

        // User::factory(10)->create();
    }
}
