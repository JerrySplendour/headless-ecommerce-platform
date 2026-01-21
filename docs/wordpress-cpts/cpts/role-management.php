<?php
/**
 * Role Management CPT
 * Multi-role authentication system for admin, staff, and customers
 */

// ===============================
// 1. Custom Role Definitions
// ===============================
add_action('init', function () {
    // Shop Manager role (full dashboard access)
    add_role('shop_manager', 'Shop Manager', [
        'read' => true,
        'manage_woocommerce' => true,
        'view_woocommerce_reports' => true,
        'edit_shop_orders' => true,
        'edit_others_shop_orders' => true,
        'publish_shop_orders' => true,
        'edit_products' => true,
        'edit_others_products' => true,
        'publish_products' => true,
        'delete_products' => true,
        'manage_product_terms' => true,
        'edit_users' => true,
        'list_users' => true,
    ]);

    // Cashier role (POS and orders only)
    add_role('cashier', 'Cashier', [
        'read' => true,
        'edit_shop_orders' => true,
        'edit_others_shop_orders' => true,
        'publish_shop_orders' => true,
        'read_products' => true,
    ]);

    // Inventory Manager role
    add_role('inventory_manager', 'Inventory Manager', [
        'read' => true,
        'edit_products' => true,
        'edit_others_products' => true,
        'publish_products' => true,
        'delete_products' => true,
        'manage_product_terms' => true,
        'read_shop_orders' => true,
    ]);

    // Marketer role
    add_role('marketer', 'Marketer', [
        'read' => true,
        'manage_woocommerce' => true,
        'view_woocommerce_reports' => true,
        'edit_shop_coupons' => true,
        'edit_others_shop_coupons' => true,
        'publish_shop_coupons' => true,
        'read_products' => true,
        'list_users' => true,
    ]);
});

// ===============================
// 2. Get User Permissions Endpoint
// ===============================
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/permissions', [
        'methods' => 'GET',
        'callback' => 'get_user_permissions',
        'permission_callback' => function() {
            return is_user_logged_in();
        },
    ]);
});

function get_user_permissions(WP_REST_Request $request) {
    $user = wp_get_current_user();
    $roles = $user->roles;
    
    $permissions = [];
    
    // Map roles to permissions
    $role_permissions = [
        'administrator' => ['*'],
        'shop_manager' => [
            'view_dashboard',
            'manage_orders',
            'manage_products',
            'manage_inventory',
            'manage_customers',
            'manage_staff',
            'manage_campaigns',
            'view_analytics',
            'manage_shipping',
            'manage_payments',
        ],
        'cashier' => [
            'view_dashboard',
            'manage_orders',
            'use_pos',
            'view_products',
        ],
        'inventory_manager' => [
            'view_dashboard',
            'manage_products',
            'manage_inventory',
            'view_orders',
        ],
        'marketer' => [
            'view_dashboard',
            'manage_campaigns',
            'view_analytics',
            'view_customers',
        ],
        'customer' => [
            'view_account',
            'view_orders',
            'place_orders',
        ],
    ];
    
    foreach ($roles as $role) {
        if (isset($role_permissions[$role])) {
            $permissions = array_merge($permissions, $role_permissions[$role]);
        }
    }
    
    return new WP_REST_Response([
        'user_id' => $user->ID,
        'roles' => $roles,
        'permissions' => array_unique($permissions),
    ], 200);
}

// ===============================
// 3. Assign Role to User
// ===============================
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/assign-role', [
        'methods' => 'POST',
        'callback' => 'assign_user_role',
        'permission_callback' => function() {
            return current_user_can('edit_users');
        },
    ]);
});

function assign_user_role(WP_REST_Request $request) {
    $data = $request->get_json_params();
    
    $user_id = (int) ($data['user_id'] ?? 0);
    $role = sanitize_text_field($data['role'] ?? '');
    
    if (!$user_id || !$role) {
        return new WP_REST_Response(['error' => 'User ID and role are required'], 400);
    }
    
    $allowed_roles = [
        'administrator', 'shop_manager', 'cashier', 
        'inventory_manager', 'marketer', 'customer'
    ];
    
    if (!in_array($role, $allowed_roles)) {
        return new WP_REST_Response(['error' => 'Invalid role'], 400);
    }
    
    $user = get_user_by('ID', $user_id);
    if (!$user) {
        return new WP_REST_Response(['error' => 'User not found'], 404);
    }
    
    // Remove all roles and assign new one
    $user->set_role($role);
    
    return new WP_REST_Response([
        'success' => true,
        'user_id' => $user_id,
        'role' => $role,
        'message' => 'Role assigned successfully'
    ], 200);
}

// ===============================
// 4. Create Staff Account
// ===============================
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/create-staff', [
        'methods' => 'POST',
        'callback' => 'create_staff_account',
        'permission_callback' => function() {
            return current_user_can('edit_users');
        },
    ]);
});

function create_staff_account(WP_REST_Request $request) {
    $data = $request->get_json_params();
    
    $username = sanitize_user($data['username'] ?? '');
    $email = sanitize_email($data['email'] ?? '');
    $first_name = sanitize_text_field($data['first_name'] ?? '');
    $last_name = sanitize_text_field($data['last_name'] ?? '');
    $role = sanitize_text_field($data['role'] ?? 'staff');
    $password = $data['password'] ?? wp_generate_password(12, true);
    
    if (empty($username) || empty($email)) {
        return new WP_REST_Response(['error' => 'Username and email are required'], 400);
    }
    
    // Check if username or email exists
    if (username_exists($username)) {
        return new WP_REST_Response(['error' => 'Username already exists'], 400);
    }
    
    if (email_exists($email)) {
        return new WP_REST_Response(['error' => 'Email already exists'], 400);
    }
    
    // Create user
    $user_id = wp_create_user($username, $password, $email);
    
    if (is_wp_error($user_id)) {
        return new WP_REST_Response(['error' => $user_id->get_error_message()], 400);
    }
    
    // Update user meta
    wp_update_user([
        'ID' => $user_id,
        'first_name' => $first_name,
        'last_name' => $last_name,
        'display_name' => $first_name . ' ' . $last_name,
    ]);
    
    // Assign role
    $user = get_user_by('ID', $user_id);
    $user->set_role($role);
    
    // Send welcome email
    wp_mail(
        $email,
        'Your Staff Account - Toyfront',
        sprintf(
            "Hello %s,\n\nA staff account has been created for you.\n\nUsername: %s\nPassword: %s\nRole: %s\n\nLogin at: %s\n\nPlease change your password after first login.\n\nBest regards,\nToyfront Team",
            $first_name,
            $username,
            $password,
            ucfirst(str_replace('_', ' ', $role)),
            home_url('/login')
        )
    );
    
    return new WP_REST_Response([
        'success' => true,
        'user_id' => $user_id,
        'username' => $username,
        'email' => $email,
        'role' => $role,
        'message' => 'Staff account created successfully'
    ], 201);
}

// ===============================
// 5. Get Staff List
// ===============================
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/staff-list', [
        'methods' => 'GET',
        'callback' => 'get_staff_list',
        'permission_callback' => function() {
            return current_user_can('list_users');
        },
    ]);
});

function get_staff_list(WP_REST_Request $request) {
    $role = $request->get_param('role');
    
    $args = [
        'role__in' => ['administrator', 'shop_manager', 'cashier', 'inventory_manager', 'marketer'],
        'orderby' => 'display_name',
        'order' => 'ASC',
    ];
    
    if ($role) {
        $args['role'] = $role;
        unset($args['role__in']);
    }
    
    $users = get_users($args);
    $staff = [];
    
    foreach ($users as $user) {
        $staff[] = [
            'id' => $user->ID,
            'username' => $user->user_login,
            'email' => $user->user_email,
            'display_name' => $user->display_name,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'roles' => $user->roles,
            'registered' => $user->user_registered,
            'avatar_url' => get_avatar_url($user->ID),
        ];
    }
    
    return new WP_REST_Response($staff, 200);
}
