<?php
/**
 * Customer Notes Custom Post Type
 * Additional customer relationship data beyond WooCommerce
 */

// ===============================
// 1. Register Custom Post Type
// ===============================
add_action('init', function () {
    register_post_type('customer_note', [
        'labels' => [
            'name' => 'Customer Notes',
            'singular_name' => 'Customer Note',
        ],
        'public'              => false,
        'exclude_from_search' => true,
        'publicly_queryable'  => false,
        'show_ui'             => true,
        'show_in_rest'        => true,
        'show_in_nav_menus'   => false,
        'has_archive'         => false,
        'rewrite'             => false,
        'supports'            => ['title', 'editor'],
        'menu_icon'           => 'dashicons-testimonial',
    ]);
});

// ===============================
// 2. Format Customer Note Entry
// ===============================
function format_customer_note($post_id) {
    return [
        'id' => $post_id,
        'customer_id' => (int) get_post_meta($post_id, 'customer_id', true),
        'note' => get_post_field('post_content', $post_id),
        'note_type' => get_post_meta($post_id, 'note_type', true), // general, complaint, preference, vip
        'priority' => get_post_meta($post_id, 'priority', true), // low, medium, high
        'created_by' => (int) get_post_meta($post_id, 'created_by', true),
        'created_at' => get_the_date('Y-m-d H:i:s', $post_id),
    ];
}

// ===============================
// 3. Create Customer Note
// ===============================
function create_customer_note(WP_REST_Request $request) {
    if (!current_user_can('edit_shop_orders')) {
        return new WP_REST_Response(['error' => 'Unauthorized'], 403);
    }

    $data = $request->get_json_params();
    $customer_id = (int) ($data['customer_id'] ?? 0);
    $note = sanitize_textarea_field($data['note'] ?? '');

    if (!$customer_id || empty($note)) {
        return new WP_REST_Response(['error' => 'Customer ID and note are required'], 400);
    }

    $post_id = wp_insert_post([
        'post_type' => 'customer_note',
        'post_title' => 'Note for Customer #' . $customer_id,
        'post_content' => $note,
        'post_status' => 'publish',
    ]);

    update_post_meta($post_id, 'customer_id', $customer_id);
    update_post_meta($post_id, 'note_type', sanitize_text_field($data['note_type'] ?? 'general'));
    update_post_meta($post_id, 'priority', sanitize_text_field($data['priority'] ?? 'low'));
    update_post_meta($post_id, 'created_by', get_current_user_id());

    return new WP_REST_Response(format_customer_note($post_id), 200);
}

// ===============================
// 4. Get Customer Notes
// ===============================
function get_customer_notes(WP_REST_Request $request) {
    if (!current_user_can('edit_shop_orders')) {
        return new WP_REST_Response(['error' => 'Unauthorized'], 403);
    }

    $customer_id = $request->get_param('customer_id');
    
    $args = [
        'post_type' => 'customer_note',
        'posts_per_page' => -1,
        'orderby' => 'date',
        'order' => 'DESC',
    ];

    if ($customer_id) {
        $args['meta_key'] = 'customer_id';
        $args['meta_value'] = (int) $customer_id;
    }

    $posts = get_posts($args);
    $data = array_map(function ($post) {
        return format_customer_note($post->ID);
    }, $posts);

    return new WP_REST_Response($data, 200);
}

// ===============================
// 5. Register REST API Routes
// ===============================
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/customer-notes/', [
        'methods' => 'POST',
        'callback' => 'create_customer_note',
        'permission_callback' => function() {
            return current_user_can('edit_shop_orders');
        },
    ]);

    register_rest_route('custom/v1', '/customer-notes/', [
        'methods' => 'GET',
        'callback' => 'get_customer_notes',
        'permission_callback' => function() {
            return current_user_can('edit_shop_orders');
        },
    ]);
});
?>
