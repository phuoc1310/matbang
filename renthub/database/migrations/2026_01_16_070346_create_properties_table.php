<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('user_id')->nullable();

            $table->string('title');
            $table->text('description');

            $table->decimal('price', 15, 2);
            $table->float('area')->nullable();

            $table->string('type')->nullable();     // bán / cho thuê
            $table->string('address')->nullable();

            $table->enum('status', ['pending', 'approved', 'rejected'])
                  ->default('pending');

            $table->boolean('is_visible')->default(1);

            $table->timestamps();

            // 🔥 BẮT BUỘC để xóa mềm
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('properties');
    }
};
