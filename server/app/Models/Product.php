<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $table = 'tbl_products';
    protected $primaryKey = 'product_id';

    protected $fillable = [
        'product_name',
        'price',
        'stock',
        'description',
        'is_deleted',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'product_id', 'product_id');
    }
}


