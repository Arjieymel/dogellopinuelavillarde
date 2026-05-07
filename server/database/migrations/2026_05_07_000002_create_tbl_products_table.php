<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tbl_products', function (Blueprint $table) {
            $table->id('product_id');
            $table->string('product_name', 120);
            $table->decimal('price', 12, 2)->default(0);
            $table->integer('stock')->default(0);
            $table->text('description')->nullable();
            $table->boolean('is_deleted')->default(false);
            $table->timestamps();
        });

        Schema::table('tbl_products', function (Blueprint $table) {
            $table->index('stock');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_products');
    }
};

