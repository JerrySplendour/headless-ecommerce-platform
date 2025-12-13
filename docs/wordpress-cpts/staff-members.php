<?php
/**
 * Staff Members Custom Post Type
 * Manages store staff with roles and permissions
 */

// ===============================
// 1. Register Custom Post Type
// ===============================
add_action('init', function () {
    register_post_type('staff_member', [
        'labels' => [
            'name' => 'Staff Members',
            'singular_name' => 'Staff Member',
            'add_new' => 'Add New Staff',
            'add_new_item' => 'Add New Staff Member',
            'edit_item' => 'Edit Staff Member',
            'view_item' => 'View Staff Member',
            'search_items' => 'Search Staff',
        ],
        'public'              => false,
        'exclude_from_search' => true,
        'publicly_queryable'  => false,
        'show_ui'             => true,
        'show_in_rest'        => true,
        'show_in_nav_menus'   => false,
        'show_in_admin_bar'   => true,
        'has_archive'         => false,
        'rewrite'             => false,
        'query_var'           => false,
        'supports'            => ['title', 'thumbnail'],
        'menu_icon'           => 'dashicons-groups',
    ]);
});

// ===============================
// 2. Format a Staff Member Entry
// ===============================
function format_staff_member($post_id) {
    return [
        'id' => $post_id,
        'name' => get_the_title($post_id),
        'email' => get_post_meta($post_id, 'email', true),
        'phone' => get_post_meta($post_id, 'phone', true),
        'role' => get_post_meta($post_id, 'role', true), // admin, manager, staff
        'status' => get_post_meta($post_id, 'status', true), // active, inactive
        'hire_date' => get_post_meta($post_id, 'hire_date', true),
        'permissions' => json_decode(get_post_meta($post_id, 'permissions', true) ?: '[]', true),
        'avatar_url' => get_the_post_thumbnail_url($post_id, 'thumbnail'),
        'created_at' => get_the_date('Y-m-d H:i:s', $post_id),
    ];
}

// ===============================
// 3. Create or Update Staff Member
// ===============================
function create_staff_member(WP_REST_Request $request) {
    // Check admin permission
    if (!current_user_can('manage_woocommerce')) {
        return new WP_REST_Response(['error' => 'Unauthorized'], 403);
    }

    $data = $request->get_json_params();
    $name = sanitize_text_field($data['name'] ?? '');
    $email = sanitize_email($data['email'] ?? '');

    if (empty($name) || empty($email)) {
        return new WP_REST_Response(['error' => 'Name and email are required'], 400);
    }

    // Check for existing staff with same email
    $existing = get_posts([
        'post_type' => 'staff_member',
        'meta_key' => 'email',
        'meta_value' => $email,
        'posts_per_page' => 1,
        'fields' => 'ids',
    ]);

    $post_id = !empty($existing) ? $existing[0] : null;

    if ($post_id) {
        wp_update_post([
            'ID' => $post_id,
            'post_title' => $name,
        ]);
    } else {
        $post_id = wp_insert_post([
            'post_type' => 'staff_member',
            'post_title' => $name,
            'post_status' => 'publish',
        ]);
    }

    // Update meta fields
    update_post_meta($post_id, 'email', $email);
    update_post_meta($post_id, 'phone', sanitize_text_field($data['phone'] ?? ''));
    update_post_meta($post_id, 'role', sanitize_text_field($data['role'] ?? 'staff'));
    update_post_meta($post_id, 'status', sanitize_text_field($data['status'] ?? 'active'));
    update_post_meta($post_id, 'hire_date', sanitize_text_field($data['hire_date'] ?? current_time('Y-m-d')));
    update_post_meta($post_id, 'permissions', json_encode($data['permissions'] ?? []));

    return new WP_REST_Response(format_staff_member($post_id), 200);
}

// ===============================
// 4. Get All Staff Members
// ===============================
function get_staff_members(WP_REST_Request $request) {
    if (!current_user_can('manage_woocommerce')) {
        return new WP_REST_Response(['error' => 'Unauthorized'], 403);
    }

    $status = $request->get_param('status');
    $role = $request->get_param('role');

    $args = [
        'post_type' => 'staff_member',
        'posts_per_page' => -1,
        'orderby' => 'title',
        'order' => 'ASC',
    ];

    $meta_query = ['relation' => 'AND'];
    if ($status) {
        $meta_query[] = ['key' => 'status', 'value' => $status];
    }
    if ($role) {
        $meta_query[] = ['key' => 'role', 'value' => $role];
    }
    if (count($meta_query) > 1) {
        $args['meta_query'] = $meta_query;
    }

    $posts = get_posts($args);
    $data = array_map(function ($post) {
        return format_staff_member($post->ID);
    }, $posts);

    return new WP_REST_Response($data, 200);
}

// ===============================
// 5. Delete Staff Member
// ===============================
function delete_staff_member(WP_REST_Request $request) {
    if (!current_user_can('manage_woocommerce')) {
        return new WP_REST_Response(['error' => 'Unauthorized'], 403);
    }

    $id = (int) $request->get_param('id');
    if (!$id) {
        return new WP_REST_Response(['error' => 'Invalid ID'], 400);
    }

    wp_delete_post($id, true);
    return new WP_REST_Response(['message' => 'Staff member deleted', 'id' => $id], 200);
}

// ===============================
// 6. Register REST API Routes
// ===============================
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/staff/', [
        'methods' => 'POST',
        'callback' => 'create_staff_member',
        'permission_callback' => function() {
            return current_user_can('manage_woocommerce');
        },
    ]);

    register_rest_route('custom/v1', '/staff/', [
        'methods' => 'GET',
        'callback' => 'get_staff_members',
        'permission_callback' => function() {
            return current_user_can('manage_woocommerce');
        },
    ]);

    register_rest_route('custom/v1', '/staff/(?P<id>\d+)', [
        'methods' => 'DELETE',
        'callback' => 'delete_staff_member',
        'permission_callback' => function() {
            return current_user_can('manage_woocommerce');
        },
    ]);
});
?>
