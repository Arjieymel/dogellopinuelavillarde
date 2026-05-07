<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GenderController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\DeliveryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReportController;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::controller(AuthController::class)->prefix('/auth')->group(function () {
    Route::post('/login', 'login');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::controller(AuthController::class)->prefix('/auth')->group(function () {
        Route::get('/me', 'me');
        Route::post('/logout', 'logout');
    });

    Route::controller(GenderController::class)->prefix('/gender')->group(function () {
        Route::get('/loadGenders', 'loadGenders'); // /gender/loadGenders
        Route::get('/getGender/{genderId}', 'getGender');
        Route::post('/storeGender', 'storeGender'); // /gender/storeGender
        Route::put('/updateGender/{gender}', 'updateGender');
        Route::put('/destroyGender/{gender}', 'destroyGender');
    });

    Route::controller(UserController::class)->prefix('/user')->group(function () {
        Route::get('/loadUsers', 'loadUsers');
        Route::post('/storeUser', 'storeUser');
        Route::put('/updateUser/{user}', 'updateUser');
        Route::put('/destroyUser/{user}', 'destroyUser');
    });

    Route::controller(DashboardController::class)->prefix('/dashboard')->group(function () {
        Route::get('/summary', 'summary');
        Route::get('/salesChart', 'summary'); // backward compatibility if needed
    });

    Route::controller(CustomerController::class)->prefix('/customers')->group(function () {
        Route::get('/loadCustomers', 'loadCustomers');
        Route::post('/storeCustomer', 'storeCustomer');
        Route::get('/getCustomer/{customerId}', 'getCustomer');
        Route::put('/updateCustomer/{customer}', 'updateCustomer');
        Route::put('/destroyCustomer/{customer}', 'destroyCustomer');
    });

    Route::controller(ProductController::class)->prefix('/products')->group(function () {
        Route::get('/loadProducts', 'loadProducts');
        Route::post('/storeProduct', 'storeProduct');
        Route::get('/getProduct/{productId}', 'getProduct');
        Route::put('/updateProduct/{product}', 'updateProduct');
        Route::put('/destroyProduct/{product}', 'destroyProduct');
        Route::get('/lowStockCount', 'lowStockCount');
    });

    Route::controller(OrderController::class)->prefix('/orders')->group(function () {
        Route::get('/loadOrders', 'loadOrders');
        Route::post('/storeOrder', 'storeOrder');
        Route::get('/getOrder/{orderId}', 'getOrder');
        Route::put('/updateOrder/{order}', 'updateOrder');
        Route::put('/cancelOrder/{order}', 'cancelOrder');
    });


    Route::controller(DeliveryController::class)->prefix('/deliveries')->group(function () {
        Route::get('/loadDeliveries', 'loadDeliveries');
        Route::post('/storeDelivery', 'storeDelivery');
        Route::get('/getDelivery/{deliveryId}', 'getDelivery');
        Route::put('/updateDelivery/{delivery}', 'updateDelivery');
        Route::put('/cancelDelivery/{delivery}', 'cancelDelivery');
    });


    Route::controller(ReportController::class)->prefix('/reports')->group(function () {
        Route::get('/dailySales', 'dailySales');
        Route::get('/monthlySales', 'monthlySales');
        Route::get('/totals', 'totals');
    });
});

