<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function loadProducts(Request $request)
    {
        $search = $request->input('search');

        $products = Product::query()
            ->where('is_deleted', false)
            ->orderBy('product_name', 'asc');

        if ($search) {
            $products->where(function ($q) use ($search) {
                $q->where('product_name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $products = $products->paginate(15);

        return response()->json([
            'products' => $products,
        ], 200);
    }

    public function storeProduct(Request $request)
    {
        $validated = $request->validate([
            'product_name' => ['required', 'string', 'max:120'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        Product::create([
            'product_name' => $validated['product_name'],
            'price' => $validated['price'],
            'stock' => $validated['stock'],
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'message' => 'Product Successfully Saved.',
        ], 200);
    }

    public function getProduct($productId)
    {
        $product = Product::where('product_id', $productId)
            ->where('is_deleted', false)
            ->first();

        return response()->json([
            'product' => $product,
        ], 200);
    }

    public function updateProduct(Request $request, Product $product)
    {
        $validated = $request->validate([
            'product_name' => ['required', 'string', 'max:120'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $product->update([
            'product_name' => $validated['product_name'],
            'price' => $validated['price'],
            'stock' => $validated['stock'],
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'product' => $product->fresh(),
            'message' => 'Product Successfully Updated.',
        ], 200);
    }

    public function destroyProduct(Product $product)
    {
        $product->update([
            'is_deleted' => true,
        ]);

        return response()->json([
            'message' => 'Product Successfully Deleted.',
        ], 200);
    }

    public function lowStockCount(Request $request)
    {
        $threshold = (int) $request->input('threshold', 10);

        $count = Product::where('is_deleted', false)
            ->where('stock', '<=', $threshold)
            ->count();

        return response()->json(['count' => $count], 200);
    }
}

