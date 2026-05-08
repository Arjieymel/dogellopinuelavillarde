<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tbl_orders', function (Blueprint $table) {
            $table->boolean('is_archived')->default(false)->after('is_deleted');
        });

        Schema::table('tbl_deliveries', function (Blueprint $table) {
            $table->boolean('is_archived')->default(false)->after('is_deleted');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_orders', function (Blueprint $table) {
            $table->dropColumn('is_archived');
        });

        Schema::table('tbl_deliveries', function (Blueprint $table) {
            $table->dropColumn('is_archived');
        });
    }
};

