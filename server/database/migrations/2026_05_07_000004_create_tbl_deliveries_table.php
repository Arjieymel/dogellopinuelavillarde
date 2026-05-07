<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tbl_deliveries', function (Blueprint $table) {
            $table->id('delivery_id');

            $table->unsignedBigInteger('order_id');
            $table->string('driver_name', 100);
            $table->date('delivery_date');
            $table->string('delivery_status', 40)->default('Pending');
            $table->boolean('is_deleted')->default(false);

            $table->timestamps();

            $table->foreign('order_id')->references('order_id')->on('tbl_orders')->cascadeOnDelete();
            $table->index('delivery_status');
            $table->index('driver_name');
            $table->index('delivery_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_deliveries');
    }
};

