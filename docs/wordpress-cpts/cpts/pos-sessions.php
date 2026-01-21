<?php
/**
 * POS Sessions Custom Post Type
 * Track Point of Sale transaction sessions
 */

// ===============================
// 1. Register Custom Post Type
// ===============================
add_action('init', function () {
    register_post_type('pos_session', [
        'labels' => [
            'name' => 'POS Sessions',
            'singular_name' => 'POS Session',
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
        'menu_icon'           => 'dashicons-calculator',
    ]);
});

// ===============================
// 2. Format POS Session Entry
// ===============================
function format_pos_session($post_id) {
    return [
        'id' => $post_id,
        'session_name' => get_the_title($post_id),
        'staff_id' => (int) get_post_meta($post_id, 'staff_id', true),
        'staff_name' => get_post_meta($post_id, 'staff_name', true),
        'start_time' => get_post_meta($post_id, 'start_time', true),
        'end_time' => get_post_meta($post_id, 'end_time', true),
        'opening_cash' => (float) get_post_meta($post_id, 'opening_cash', true),
        'closing_cash' => (float) get_post_meta($post_id, 'closing_cash', true),
        'total_sales' => (float) get_post_meta($post_id, 'total_sales', true),
        'total_transactions' => (int) get_post_meta($post_id, 'total_transactions', true),
        'status' => get_post_meta($post_id, 'status', true), // open, closed
        'order_ids' => json_decode(get_post_meta($post_id, 'order_ids', true) ?: '[]', true),
    ];
}

// ===============================
// 3. Create or Update POS Session
// ===============================
function create_pos_session(WP_REST_Request $request) {
    if (!current_user_can('edit_shop_orders')) {
        return new WP_REST_Response(['error' => 'Unauthorized'], 403);
    }

    $data = $request->get_json_params();
    $staff_id = (int) ($data['staff_id'] ?? 0);
    $staff_name = sanitize_text_field($data['staff_name'] ?? '');

    if (!$staff_id || empty($staff_name)) {
        return new WP_REST_Response(['error' => 'Staff ID and name are required'], 400);
    }

    $session_id = $data['id'] ?? null;

    if ($session_id) {
        // Update existing session
        wp_update_post([
            'ID' => $session_id,
            'post_title' => 'Session - ' . $staff_name . ' - ' . current_time('Y-m-d H:i'),
        ]);
        $post_id = $session_id;
    } else {
        // Create new session
        $post_id = wp_insert_post([
            'post_type' => 'pos_session',
            'post_title' => 'Session - ' . $staff_name . ' - ' . current_time('Y-m-d H:i'),
            'post_status' => 'publish',
        ]);
    }

    update_post_meta($post_id, 'staff_id', $staff_id);
    update_post_meta($post_id, 'staff_name', $staff_name);
    update_post_meta($post_id, 'start_time', $data['start_time'] ?? current_time('Y-m-d H:i:s'));
    update_post_meta($post_id, 'end_time', $data['end_time'] ?? '');
    update_post_meta($post_id, 'opening_cash', (float) ($data['opening_cash'] ?? 0));
    update_post_meta($post_id, 'closing_cash', (float) ($data['closing_cash'] ?? 0));
    update_post_meta($post_id, 'total_sales', (float) ($data['total_sales'] ?? 0));
    update_post_meta($post_id, 'total_transactions', (int) ($data['total_transactions'] ?? 0));
    update_post_meta($post_id, 'status', sanitize_text_field($data['status'] ?? 'open'));
    update_post_meta($post_id, 'order_ids', json_encode($data['order_ids'] ?? []));

    return new WP_REST_Response(format_pos_session($post_id), 200);
}

// ===============================
// 4. Get POS Sessions
// ===============================
function get_pos_sessions(WP_REST_Request $request) {
    if (!current_user_can('edit_shop_orders')) {
        return new WP_REST_Response(['error' => 'Unauthorized'], 403);
    }

    $staff_id = $request->get_param('staff_id');
    $status = $request->get_param('status');

    $args = [
        'post_type' => 'pos_session',
        'posts_per_page' => -1,
        'orderby' => 'date',
        'order' => 'DESC',
    ];

    $meta_query = ['relation' => 'AND'];
    if ($staff_id) {
        $meta_query[] = ['key' => 'staff_id', 'value' => (int) $staff_id];
    }
    if ($status) {
        $meta_query[] = ['key' => 'status', 'value' => $status];
    }
    if (count($meta_query) > 1) {
        $args['meta_query'] = $meta_query;
    }

    $posts = get_posts($args);
    $data = array_map(function ($post) {
        return format_pos_session($post->ID);
    }, $posts);

    return new WP_REST_Response($data, 200);
}

// ===============================
// 5. Register REST API Routes
// ===============================
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/pos-sessions/', [
        'methods' => 'POST',
        'callback' => 'create_pos_session',
        'permission_callback' => function() {
            return current_user_can('edit_shop_orders');
        },
    ]);

    register_rest_route('custom/v1', '/pos-sessions/', [
        'methods' => 'GET',
        'callback' => 'get_pos_sessions',
        'permission_callback' => function() {
            return current_user_can('edit_shop_orders');
        },
    ]);
});
?>
