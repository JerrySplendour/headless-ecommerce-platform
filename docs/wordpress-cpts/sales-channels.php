<?php
/**
 * Sales Channels Custom Post Type
 * Tracks different sales channels (Website, Instagram, WhatsApp, Walk-in)
 */

// ===============================
// 1. Register Custom Post Type
// ===============================
add_action('init', function () {
    register_post_type('sales_channel', [
        'labels' => [
            'name' => 'Sales Channels',
            'singular_name' => 'Sales Channel',
        ],
        'public'              => false,
        'exclude_from_search' => true,
        'publicly_queryable'  => false,
        'show_ui'             => true,
        'show_in_rest'        => true,
        'show_in_nav_menus'   => false,
        'has_archive'         => false,
        'rewrite'             => false,
        'supports'            => ['title'],
        'menu_icon'           => 'dashicons-networking',
    ]);
});

// ===============================
// 2. Format Sales Channel Entry
// ===============================
function format_sales_channel($post_id) {
    return [
        'id' => $post_id,
        'name' => get_the_title($post_id),
        'slug' => get_post_meta($post_id, 'slug', true),
        'icon' => get_post_meta($post_id, 'icon', true),
        'color' => get_post_meta($post_id, 'color', true),
        'enabled' => get_post_meta($post_id, 'enabled', true) === '1',
        'total_orders' => (int) get_post_meta($post_id, 'total_orders', true),
        'total_revenue' => (float) get_post_meta($post_id, 'total_revenue', true),
    ];
}

// ===============================
// 3. Create or Update Sales Channel
// ===============================
function create_sales_channel(WP_REST_Request $request) {
    if (!current_user_can('manage_woocommerce')) {
        return new WP_REST_Response(['error' => 'Unauthorized'], 403);
    }

    $data = $request->get_json_params();
    $name = sanitize_text_field($data['name'] ?? '');
    $slug = sanitize_title($data['slug'] ?? $name);

    if (empty($name)) {
        return new WP_REST_Response(['error' => 'Name is required'], 400);
    }

    $existing = get_posts([
        'post_type' => 'sales_channel',
        'meta_key' => 'slug',
        'meta_value' => $slug,
        'posts_per_page' => 1,
        'fields' => 'ids',
    ]);

    $post_id = !empty($existing) ? $existing[0] : null;

    if ($post_id) {
        wp_update_post(['ID' => $post_id, 'post_title' => $name]);
    } else {
        $post_id = wp_insert_post([
            'post_type' => 'sales_channel',
            'post_title' => $name,
            'post_status' => 'publish',
        ]);
    }

    update_post_meta($post_id, 'slug', $slug);
    update_post_meta($post_id, 'icon', sanitize_text_field($data['icon'] ?? ''));
    update_post_meta($post_id, 'color', sanitize_hex_color($data['color'] ?? '#000000'));
    update_post_meta($post_id, 'enabled', $data['enabled'] ? '1' : '0');

    return new WP_REST_Response(format_sales_channel($post_id), 200);
}

// ===============================
// 4. Get All Sales Channels
// ===============================
function get_sales_channels(WP_REST_Request $request) {
    $posts = get_posts([
        'post_type' => 'sales_channel',
        'posts_per_page' => -1,
        'orderby' => 'title',
        'order' => 'ASC',
    ]);

    $data = array_map(function ($post) {
        return format_sales_channel($post->ID);
    }, $posts);

    return new WP_REST_Response($data, 200);
}

// ===============================
// 5. Register REST API Routes
// ===============================
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/sales-channels/', [
        'methods' => 'POST',
        'callback' => 'create_sales_channel',
        'permission_callback' => function() {
            return current_user_can('manage_woocommerce');
        },
    ]);

    register_rest_route('custom/v1', '/sales-channels/', [
        'methods' => 'GET',
        'callback' => 'get_sales_channels',
        'permission_callback' => '__return_true',
    ]);
});

// ===============================
// 6. Initialize Default Channels
// ===============================
add_action('init', function() {
    $defaults = [
        ['name' => 'Website', 'slug' => 'website', 'icon' => 'globe', 'color' => '#3b82f6'],
        ['name' => 'Instagram', 'slug' => 'instagram', 'icon' => 'instagram', 'color' => '#e4405f'],
        ['name' => 'WhatsApp', 'slug' => 'whatsapp', 'icon' => 'message-circle', 'color' => '#25d366'],
        ['name' => 'Walk-in', 'slug' => 'walk-in', 'icon' => 'store', 'color' => '#8b5cf6'],
    ];

    foreach ($defaults as $channel) {
        $existing = get_posts([
            'post_type' => 'sales_channel',
            'meta_key' => 'slug',
            'meta_value' => $channel['slug'],
            'posts_per_page' => 1,
        ]);

        if (empty($existing)) {
            $post_id = wp_insert_post([
                'post_type' => 'sales_channel',
                'post_title' => $channel['name'],
                'post_status' => 'publish',
            ]);
            update_post_meta($post_id, 'slug', $channel['slug']);
            update_post_meta($post_id, 'icon', $channel['icon']);
            update_post_meta($post_id, 'color', $channel['color']);
            update_post_meta($post_id, 'enabled', '1');
        }
    }
}, 99);
?>
