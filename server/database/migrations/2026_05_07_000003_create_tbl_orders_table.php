<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tbl_orders', function (Blueprint $table) {
            $table->id('order_id');

            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('product_id');

            $table->integer('quantity')->default(1);
            $table->decimal('total_amount', 12, 2)->default(0);

            $table->string('status', 30)->default('Pending');
            $table->boolean('is_deleted')->default(false);

            $table->timestamps();

            $table->foreign('customer_id')->references('customer_id')->on('tbl_customers')->cascadeOnDelete();
            $table->foreign('product_id')->references('product_id')->on('tbl_products')->cascadeOnDelete();

            $table->index(['customer_id', 'product_id']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_orders');
    }
};

