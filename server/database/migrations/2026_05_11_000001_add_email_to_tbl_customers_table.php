<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tbl_customers', function (Blueprint $table) {
            // Nullable because requirement says show "No Email" when null/empty.
            $table->string('email', 191)->nullable()->after('contact_number');

            // Make email unique when provided.
            $table->unique('email');
        });
    }

    public function down(): void
    {
        Schema::table('tbl_customers', function (Blueprint $table) {
            $table->dropUnique(['email']);
            $table->dropColumn('email');
        });
    }
};

