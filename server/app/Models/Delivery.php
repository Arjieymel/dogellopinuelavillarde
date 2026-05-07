<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Delivery extends Model
{
    use HasFactory;

    protected $table = 'tbl_deliveries';
    protected $primaryKey = 'delivery_id';

    protected $fillable = [
        'order_id',
        'driver_name',
        'delivery_date',
        'delivery_status',
        'is_deleted',
    ];

    protected $casts = [
        'delivery_date' => 'date',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'order_id');
    }
}

