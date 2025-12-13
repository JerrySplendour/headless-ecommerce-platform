<?php
/**
 * WooCommerce Extensions
 * Add custom fields and functionality to WooCommerce orders and products
 */

// ===============================
// 1. Add Sales Channel to Orders
// ===============================
add_action('woocommerce_checkout_create_order', function($order, $data) {
    $channel = sanitize_text_field($_POST['sales_channel'] ?? 'website');
    $order->update_meta_data('_sales_channel', $channel);
}, 10, 2);

// ===============================
// 2. Add Sales Channel to REST API
// ===============================
add_filter('woocommerce_rest_prepare_shop_order_object', function($response, $order, $request) {
    $response->data['sales_channel'] = $order->get_meta('_sales_channel') ?: 'website';
    return $response;
}, 10, 3);

// ===============================
// 3. Custom Order Endpoint with Channel Filter
// ===============================
function get_orders_by_channel(WP_REST_Request $request) {
    if (!current_user_can('edit_shop_orders')) {
        return new WP_REST_Response(['error' => 'Unauthorized'], 403);
    }

    $channel = $request->get_param('channel');
    $status = $request->get_param('status');
    $page = max(1, (int) $request->get_param('page'));
    $per_page = max(1, min(100, (int) $request->get_param('per_page') ?: 20));

    $args = [
        'limit' => $per_page,
        'page' => $page,
        'orderby' => 'date',
        'order' => 'DESC',
    ];

    if ($status) {
        $args['status'] = $status;
    }

    if ($channel) {
        $args['meta_key'] = '_sales_channel';
        $args['meta_value'] = $channel;
    }

    $orders = wc_get_orders($args);
    $data = array_map(function($order) {
        return [
            'id' => $order->get_id(),
            'order_number' => $order->get_order_number(),
            'status' => $order->get_status(),
            'total' => $order->get_total(),
            'currency' => $order->get_currency(),
            'customer_id' => $order->get_customer_id(),
            'customer_name' => $order->get_billing_first_name() . ' ' . $order->get_billing_last_name(),
            'customer_email' => $order->get_billing_email(),
            'sales_channel' => $order->get_meta('_sales_channel') ?: 'website',
            'date_created' => $order->get_date_created()->date('Y-m-d H:i:s'),
            'line_items' => array_map(function($item) {
                return [
                    'product_id' => $item->get_product_id(),
                    'name' => $item->get_name(),
                    'quantity' => $item->get_quantity(),
                    'total' => $item->get_total(),
                ];
            }, $order->get_items()),
        ];
    }, $orders);

    return new WP_REST_Response($data, 200);
}

// ===============================
// 4. Analytics Endpoint
// ===============================
function get_analytics_data(WP_REST_Request $request) {
    if (!current_user_can('view_woocommerce_reports')) {
        return new WP_REST_Response(['error' => 'Unauthorized'], 403);
    }

    $start_date = $request->get_param('start_date') ?: date('Y-m-d', strtotime('-30 days'));
    $end_date = $request->get_param('end_date') ?: date('Y-m-d');

    // Get orders in date range
    $orders = wc_get_orders([
        'limit' => -1,
        'date_created' => $start_date . '...' . $end_date,
        'status' => ['completed', 'processing'],
    ]);

    $total_revenue = 0;
    $total_orders = count($orders);
    $channels = [];
    $products = [];

    foreach ($orders as $order) {
        $total_revenue += $order->get_total();
        
        // Track by channel
        $channel = $order->get_meta('_sales_channel') ?: 'website';
        if (!isset($channels[$channel])) {
            $channels[$channel] = ['orders' => 0, 'revenue' => 0];
        }
        $channels[$channel]['orders']++;
        $channels[$channel]['revenue'] += $order->get_total();

        // Track products
        foreach ($order->get_items() as $item) {
            $product_id = $item->get_product_id();
            if (!isset($products[$product_id])) {
                $products[$product_id] = [
                    'id' => $product_id,
                    'name' => $item->get_name(),
                    'quantity' => 0,
                    'revenue' => 0,
                ];
            }
            $products[$product_id]['quantity'] += $item->get_quantity();
            $products[$product_id]['revenue'] += $item->get_total();
        }
    }

    // Sort products by revenue
    usort($products, function($a, $b) {
        return $b['revenue'] - $a['revenue'];
    });

    // Get customer count
    $customer_count = count(get_users(['role' => 'customer']));

    return new WP_REST_Response([
        'total_revenue' => $total_revenue,
        'total_orders' => $total_orders,
        'average_order_value' => $total_orders > 0 ? $total_revenue / $total_orders : 0,
        'total_customers' => $customer_count,
        'sales_by_channel' => $channels,
        'top_products' => array_slice($products, 0, 10),
    ], 200);
}

// ===============================
// 5. Register Custom REST Routes
// ===============================
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/orders/', [
        'methods' => 'GET',
        'callback' => 'get_orders_by_channel',
        'permission_callback' => function() {
            return current_user_can('edit_shop_orders');
        },
    ]);

    register_rest_route('custom/v1', '/analytics/', [
        'methods' => 'GET',
        'callback' => 'get_analytics_data',
        'permission_callback' => function() {
            return current_user_can('view_woocommerce_reports');
        },
    ]);
});
?>
