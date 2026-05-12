<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerController extends Controller
{
    public function loadCustomers(Request $request)
    {
        $search = $request->input('search');

        $customers = Customer::query()
            ->where('is_deleted', false)
            ->orderBy('fullname', 'asc');

        if ($search) {
            $customers->where(function ($q) use ($search) {
                $q->where('fullname', 'like', "%{$search}%")
                    ->orWhere('contact_number', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        $customers = $customers->paginate(15);

        // Ensure email is present in the JSON payload (debugging + safety)
        $customers->getCollection()->transform(function ($customer) {
            // Debug/safety: ensure email is present on the returned payload
            $customer->email = $customer->email ?? null;
            return $customer;
        });

        return response()->json([
            'customers' => $customers,
        ], 200);


    }

    public function storeCustomer(Request $request)
    {
        $validated = $request->validate([
            'fullname' => ['required', 'string', 'max:100'],
            'contact_number' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'string', 'email', 'max:191', 'unique:tbl_customers,email'],
            'address' => ['nullable', 'string', 'max:1000'],
        ]);

        Customer::create([
            'fullname' => $validated['fullname'],
            'contact_number' => $validated['contact_number'],
            'email' => $validated['email'] ?? null,
            'address' => $validated['address'] ?? null,
        ]);

        return response()->json([
            'message' => 'Customer Successfully Saved.',
        ], 200);
    }

    public function getCustomer($customerId)
    {
        $customer = Customer::where('customer_id', $customerId)
            ->where('is_deleted', false)
            ->first();

        if ($customer) {
            $customer->email = $customer->email ?? null;
        }

        return response()->json([
            'customer' => $customer,
        ], 200);

    }

    public function updateCustomer(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'fullname' => ['required', 'string', 'max:100'],
            'contact_number' => ['required', 'string', 'max:30'],
            'email' => [
                'nullable',
                'string',
                'email',
                'max:191',
                // unique but ignore current customer
                'unique:tbl_customers,email,' . $customer->customer_id . ',customer_id',
            ],
            'address' => ['nullable', 'string', 'max:1000'],
        ]);

        $customer->update([
            'fullname' => $validated['fullname'],
            'contact_number' => $validated['contact_number'],
            'email' => $validated['email'] ?? null,
            'address' => $validated['address'] ?? null,
        ]);

        $fresh = $customer->fresh();
        if ($fresh) {
            $fresh->email = $fresh->email ?? null;
        }

        return response()->json([
            'customer' => $fresh,
            'message' => 'Customer Successfully Updated.',
        ], 200);

    }

    public function destroyCustomer(Customer $customer)
    {
        $customer->update([
            'is_deleted' => true,
        ]);

        return response()->json([
            'message' => 'Customer Successfully Deleted.',
        ], 200);
    }
}


