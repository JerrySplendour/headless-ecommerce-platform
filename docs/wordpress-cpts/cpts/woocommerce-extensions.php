<?php
/**
 * WooCommerce Extensions
 * Add custom fields and functionality to WooCommerce orders and products
 */

if (!class_exists('WooCommerce')) {
    return;
}

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

///============================================
// 6. Additional REST Endpoint for Product Categories
// ============================================
add_action('rest_api_init', function () {
    register_rest_route('toyfront/v1', '/products', [
        'methods'  => 'GET',
        'callback' => function (WP_REST_Request $request) {

            if (!class_exists('WooCommerce')) {
                return new WP_Error('wc_missing', 'WooCommerce not active', ['status' => 500]);
            }

            $slug     = $request->get_param('slug');
            $id       = $request->get_param('id');
            $search   = $request->get_param('search');
            $category = $request->get_param('category');
            $page     = max(1, (int) $request->get_param('page') ?: 1);
            $per_page = max(1, min(100, (int) $request->get_param('per_page') ?: 12));

            // If slug or ID, fetch single product(s)
            if ($slug) {
                $post = get_page_by_path(sanitize_title($slug), OBJECT, 'product');
                if (!$post) {
                    return new WP_Error('not_found', 'Product not found', ['status' => 404]);
                }
                $products = [wc_get_product($post->ID)];
            } elseif ($id) {
                $products = [wc_get_product((int)$id)];
            } else {
                // List products with filters
                $args = [
                    'status' => 'publish',
                    'limit'  => $per_page,
                    'offset' => ($page - 1) * $per_page,
                ];

                if ($search) {
                    $args['s'] = sanitize_text_field($search);
                }

                if ($category) {
                    $term = get_term($category, 'product_cat');
                    if ($term && !is_wp_error($term)) {
                        $args['category'] = [$term->slug];
                    }
                }

                $products = wc_get_products($args);
            }

            $data = [];
            foreach ($products as $product) {
                if (!$product) continue;

                $images = [];
                if ($product->get_image_id()) {
                    $images[] = [
                        'id'  => $product->get_image_id(),
                        'src' => wp_get_attachment_url($product->get_image_id()),
                    ];
                }

                foreach ($product->get_gallery_image_ids() as $image_id) {
                    $images[] = [
                        'id'  => $image_id,
                        'src' => wp_get_attachment_url($image_id),
                    ];
                }

                $data[] = [
                    'id'            => $product->get_id(),
                    'name'          => $product->get_name(),
                    'slug'          => $product->get_slug(),
                    'price'         => $product->get_price(),
                    'regular_price' => $product->get_regular_price(),
                    'sale_price'    => $product->get_sale_price(),
                    'stock_status'  => $product->get_stock_status(),
                    'description'   => $product->get_description(),
                    'images'        => $images,
                    'categories'    => array_map(fn($c) => [
                        'id'   => $c->term_id,
                        'name' => $c->name,
                        'slug' => $c->slug,
                    ], wp_get_post_terms($product->get_id(), 'product_cat')),
                ];
            }

            // Set total & totalPages headers for frontend
            $total = wc_get_products([
                'status'   => 'publish',
                'limit'    => -1,
                's'        => $search ?: '',
                'category' => isset($term) ? [$term->slug] : null,
            ]);

            $total_count = count($total);
            $total_pages = ceil($total_count / $per_page);

            header("X-WP-Total: {$total_count}");
            header("X-WP-TotalPages: {$total_pages}");

            return rest_ensure_response($slug || $id ? $data[0] : $data);
        },
        'permission_callback' => '__return_true',
    ]);
});

///============================================
// 6. Additional REST Endpoint for Product Categories
// ============================================
add_action('rest_api_init', function () {
  register_rest_route('toyfront/v1', '/categories', [
    'methods' => 'GET',
    'callback' => function () {

      if (!class_exists('WooCommerce')) {
        return new WP_Error('wc_missing', 'WooCommerce not active', ['status' => 500]);
      }

      $terms = get_terms([
        'taxonomy'   => 'product_cat',
        'hide_empty' => true,
      ]);

      if (is_wp_error($terms)) {
        return $terms;
      }

      $data = array_map(function ($term) {
        $thumbnail_id = get_term_meta($term->term_id, 'thumbnail_id', true);

        return [
          'id'    => $term->term_id,
          'name'  => $term->name,
          'slug'  => $term->slug,
          'count' => $term->count,
          'image' => $thumbnail_id ? wp_get_attachment_url($thumbnail_id) : null,
        ];
      }, $terms);

      return rest_ensure_response($data);
    },
    'permission_callback' => '__return_true',
  ]);
});


?>
