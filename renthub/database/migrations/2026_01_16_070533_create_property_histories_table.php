<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('property_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('property_id');
            $table->unsignedBigInteger('changed_by')->nullable(); // Nullable vì có thể là system/automated
            $table->json('old_data')->nullable();
            $table->json('new_data')->nullable();
            $table->string('reason')->nullable();
            $table->timestamps();

            $table->foreign('property_id')->references('id')->on('properties')->onDelete('cascade');
        });

    }

    public function down()
    {
        Schema::dropIfExists('property_histories');
    }
};
