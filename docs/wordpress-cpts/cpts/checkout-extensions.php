<?php
/**
 * Checkout Extensions CPT
 * Extended checkout functionality including guest checkout with save details option
 */

// ===============================
// 1. Guest Checkout with Account Creation
// ===============================
add_action('rest_api_init', function () {
    register_rest_route('toyfront/v1', '/guest-checkout', [
        'methods' => 'POST',
        'callback' => 'handle_guest_checkout',
        'permission_callback' => '__return_true',
    ]);
});

function handle_guest_checkout(WP_REST_Request $request) {
    $data = $request->get_json_params();
    
    $email = sanitize_email($data['email'] ?? '');
    $first_name = sanitize_text_field($data['first_name'] ?? '');
    $last_name = sanitize_text_field($data['last_name'] ?? '');
    $phone = sanitize_text_field($data['phone'] ?? '');
    $address = sanitize_text_field($data['address'] ?? '');
    $city = sanitize_text_field($data['city'] ?? '');
    $state = sanitize_text_field($data['state'] ?? '');
    $country = sanitize_text_field($data['country'] ?? 'Nigeria');
    $zipcode = sanitize_text_field($data['zipcode'] ?? '');

    if (empty($email) || empty($first_name) || empty($last_name)) {
        return new WP_REST_Response([
            'error' => 'Email, first name, and last name are required'
        ], 400);
    }

    // Check if customer exists
    $existing_customer = get_user_by('email', $email);
    
    if ($existing_customer) {
        $customer_id = $existing_customer->ID;
        
        // Update customer meta with new address if provided
        update_user_meta($customer_id, 'billing_first_name', $first_name);
        update_user_meta($customer_id, 'billing_last_name', $last_name);
        update_user_meta($customer_id, 'billing_phone', $phone);
        update_user_meta($customer_id, 'billing_address_1', $address);
        update_user_meta($customer_id, 'billing_city', $city);
        update_user_meta($customer_id, 'billing_state', $state);
        update_user_meta($customer_id, 'billing_country', $country);
        update_user_meta($customer_id, 'billing_postcode', $zipcode);
        
        // Also update shipping address
        update_user_meta($customer_id, 'shipping_first_name', $first_name);
        update_user_meta($customer_id, 'shipping_last_name', $last_name);
        update_user_meta($customer_id, 'shipping_address_1', $address);
        update_user_meta($customer_id, 'shipping_city', $city);
        update_user_meta($customer_id, 'shipping_state', $state);
        update_user_meta($customer_id, 'shipping_country', $country);
        update_user_meta($customer_id, 'shipping_postcode', $zipcode);
    } else {
        // Create new WooCommerce customer
        $username = sanitize_user(strtolower($first_name . $last_name . rand(100, 999)));
        $password = wp_generate_password(12, true);
        
        $customer_id = wc_create_new_customer($email, $username, $password, [
            'first_name' => $first_name,
            'last_name' => $last_name,
        ]);
        
        if (is_wp_error($customer_id)) {
            return new WP_REST_Response([
                'error' => $customer_id->get_error_message()
            ], 400);
        }
        
        // Set customer meta
        update_user_meta($customer_id, 'billing_first_name', $first_name);
        update_user_meta($customer_id, 'billing_last_name', $last_name);
        update_user_meta($customer_id, 'billing_email', $email);
        update_user_meta($customer_id, 'billing_phone', $phone);
        update_user_meta($customer_id, 'billing_address_1', $address);
        update_user_meta($customer_id, 'billing_city', $city);
        update_user_meta($customer_id, 'billing_state', $state);
        update_user_meta($customer_id, 'billing_country', $country);
        update_user_meta($customer_id, 'billing_postcode', $zipcode);
        
        // Copy to shipping
        update_user_meta($customer_id, 'shipping_first_name', $first_name);
        update_user_meta($customer_id, 'shipping_last_name', $last_name);
        update_user_meta($customer_id, 'shipping_address_1', $address);
        update_user_meta($customer_id, 'shipping_city', $city);
        update_user_meta($customer_id, 'shipping_state', $state);
        update_user_meta($customer_id, 'shipping_country', $country);
        update_user_meta($customer_id, 'shipping_postcode', $zipcode);
        
        // Send welcome email with password
        wp_mail(
            $email,
            'Welcome to Toyfront - Your Account Details',
            sprintf(
                "Hello %s,\n\nThank you for shopping with us!\n\nAn account has been created for you:\nUsername: %s\nPassword: %s\n\nYou can log in at: %s\n\nBest regards,\nToyfront Team",
                $first_name,
                $username,
                $password,
                home_url('/login')
            )
        );
    }

    return new WP_REST_Response([
        'success' => true,
        'customer_id' => $customer_id,
        'is_new_customer' => !$existing_customer,
        'message' => $existing_customer 
            ? 'Address updated successfully' 
            : 'Account created successfully. Check your email for login details.'
    ], 200);
}

// ===============================
// 2. Shipping Cost Calculator
// ===============================
add_action('rest_api_init', function () {
    register_rest_route('toyfront/v1', '/shipping-cost', [
        'methods' => 'POST',
        'callback' => 'calculate_shipping_cost',
        'permission_callback' => '__return_true',
    ]);
});

function calculate_shipping_cost(WP_REST_Request $request) {
    $data = $request->get_json_params();
    
    $shipping_method = sanitize_text_field($data['shipping_method'] ?? '');
    $state = sanitize_text_field($data['state'] ?? '');
    $city = sanitize_text_field($data['city'] ?? '');
    $items = $data['items'] ?? [];

    // Calculate total weight and value
    $total_weight = 0;
    $total_value = 0;
    
    foreach ($items as $item) {
        $product_id = (int) ($item['product_id'] ?? 0);
        $quantity = (int) ($item['quantity'] ?? 1);
        
        if ($product_id) {
            $product = wc_get_product($product_id);
            if ($product) {
                $weight = (float) $product->get_weight();
                $total_weight += $weight * $quantity;
                $total_value += (float) $product->get_price() * $quantity;
            }
        }
    }

    // Get shipping zones and rates
    $shipping_zones = WC_Shipping_Zones::get_zones();
    $shipping_cost = 0;
    $shipping_tax = 0;

    // Default shipping rates by method and region
    $rates = [
        'Standard Delivery' => [
            'Lagos' => 2500,
            'FCT' => 3500,
            'Rivers' => 4000,
            'default' => 5000,
        ],
        'Express Delivery' => [
            'Lagos' => 5000,
            'FCT' => 7000,
            'Rivers' => 8000,
            'default' => 10000,
        ],
        'Same Day Delivery' => [
            'Lagos' => 8000,
            'FCT' => 0, // Not available
            'Rivers' => 0, // Not available
            'default' => 0,
        ],
    ];

    if (isset($rates[$shipping_method])) {
        $method_rates = $rates[$shipping_method];
        $shipping_cost = $method_rates[$state] ?? $method_rates['default'];
        
        // Add weight surcharge if over 5kg
        if ($total_weight > 5) {
            $extra_kg = ceil($total_weight - 5);
            $shipping_cost += $extra_kg * 500;
        }
        
        // Calculate tax (7.5% VAT)
        $shipping_tax = round($shipping_cost * 0.075);
    }

    return new WP_REST_Response([
        'shipping_method' => $shipping_method,
        'shipping_cost' => $shipping_cost,
        'shipping_tax' => $shipping_tax,
        'total_weight' => $total_weight,
        'estimated_delivery' => get_estimated_delivery($shipping_method, $state),
    ], 200);
}

function get_estimated_delivery($method, $state) {
    $days = [
        'Standard Delivery' => [
            'Lagos' => '3-5 business days',
            'FCT' => '5-7 business days',
            'default' => '7-10 business days',
        ],
        'Express Delivery' => [
            'Lagos' => '1-2 business days',
            'FCT' => '2-3 business days',
            'default' => '3-5 business days',
        ],
        'Same Day Delivery' => [
            'Lagos' => 'Same day (order before 12pm)',
            'default' => 'Not available',
        ],
    ];

    $method_days = $days[$method] ?? $days['Standard Delivery'];
    return $method_days[$state] ?? $method_days['default'];
}

// ===============================
// 3. Save Customer Address Endpoint
// ===============================
add_action('rest_api_init', function () {
    register_rest_route('toyfront/v1', '/save-address', [
        'methods' => 'POST',
        'callback' => 'save_customer_address',
        'permission_callback' => function() {
            return is_user_logged_in();
        },
    ]);
});

function save_customer_address(WP_REST_Request $request) {
    $user_id = get_current_user_id();
    $data = $request->get_json_params();
    
    $address_type = sanitize_text_field($data['type'] ?? 'billing'); // billing or shipping
    
    $fields = [
        'first_name', 'last_name', 'company', 'address_1', 'address_2',
        'city', 'state', 'postcode', 'country', 'phone', 'email'
    ];
    
    foreach ($fields as $field) {
        if (isset($data[$field])) {
            update_user_meta($user_id, "{$address_type}_{$field}", sanitize_text_field($data[$field]));
        }
    }
    
    return new WP_REST_Response([
        'success' => true,
        'message' => ucfirst($address_type) . ' address saved successfully'
    ], 200);
}

// ===============================
// 4. Get Customer Saved Addresses
// ===============================
add_action('rest_api_init', function () {
    register_rest_route('toyfront/v1', '/addresses', [
        'methods' => 'GET',
        'callback' => 'get_customer_addresses',
        'permission_callback' => function() {
            return is_user_logged_in();
        },
    ]);
});

function get_customer_addresses(WP_REST_Request $request) {
    $user_id = get_current_user_id();
    
    $fields = [
        'first_name', 'last_name', 'company', 'address_1', 'address_2',
        'city', 'state', 'postcode', 'country', 'phone', 'email'
    ];
    
    $billing = [];
    $shipping = [];
    
    foreach ($fields as $field) {
        $billing[$field] = get_user_meta($user_id, "billing_{$field}", true);
        $shipping[$field] = get_user_meta($user_id, "shipping_{$field}", true);
    }
    
    return new WP_REST_Response([
        'billing' => $billing,
        'shipping' => $shipping,
    ], 200);
}
