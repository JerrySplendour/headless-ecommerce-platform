<?php
/**
 * Custom Authentication & User Management
 * Handles user registration, email verification, and JWT integration
 */

// ============================================
// CHECK USERNAME AVAILABILITY
// ============================================
function check_username_availability(WP_REST_Request $request)
{
    global $wpdb;
    $username = sanitize_text_field($request->get_param('username'));

    $user = $wpdb->get_var($wpdb->prepare("SELECT ID FROM $wpdb->users WHERE user_login = %s", $username));

    return new WP_REST_Response(['available' => empty($user)], 200);
}

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/check-username', [
        'methods' => 'GET',
        'callback' => 'check_username_availability',
        'permission_callback' => '__return_true',
    ]);
});

// ============================================
// CHECK EMAIL AVAILABILITY
// ============================================
function check_email_availability(WP_REST_Request $request)
{
    global $wpdb;
    $email = sanitize_email($request->get_param('email'));

    $user = $wpdb->get_var($wpdb->prepare("SELECT ID FROM $wpdb->users WHERE user_email = %s", $email));

    return new WP_REST_Response(['available' => empty($user)], 200);
}

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/check-email', [
        'methods' => 'GET',
        'callback' => 'check_email_availability',
        'permission_callback' => '__return_true',
    ]);
});

// ============================================
// CUSTOMER REGISTRATION
// ============================================
function custom_user_registration(WP_REST_Request $request)
{
    $parameters = $request->get_json_params();
    $username = sanitize_text_field($parameters['username'] ?? '');
    $email = sanitize_email($parameters['email'] ?? '');
    $password = $parameters['password'] ?? '';
    $first_name = sanitize_text_field($parameters['first_name'] ?? '');
    $last_name = sanitize_text_field($parameters['last_name'] ?? '');

    if (!$username || !$email || !$password) {
        return new WP_Error('missing_fields', 'Username, email, and password are required', ['status' => 400]);
    }

    if (username_exists($username) || email_exists($email)) {
        return new WP_Error('user_exists', 'Username or email already exists', ['status' => 400]);
    }

    // Create customer user
    $user_id = wp_create_user($username, $password, $email);
    if (is_wp_error($user_id)) {
        return new WP_Error('registration_failed', 'User registration failed', ['status' => 500]);
    }

    // Set customer role
    $user = new WP_User($user_id);
    $user->set_role('customer');

    // Set user meta
    update_user_meta($user_id, 'first_name', $first_name);
    update_user_meta($user_id, 'last_name', $last_name);
    update_user_meta($user_id, 'is_verified', false);

    // Generate verification token
    $verification_token = wp_generate_password(32, false);
    update_user_meta($user_id, 'verification_token', $verification_token);

    // Send verification email
    $verify_link = get_site_url() . "/wp-json/custom/v1/verify-email?token=$verification_token&email=" . urlencode($email);
    $subject = 'Verify Your Account';
    $message = "Welcome to our store!\n\nClick the link below to verify your email address:\n\n$verify_link";
    wp_mail($email, $subject, $message);

    return new WP_REST_Response([
        'message' => 'Registration successful! Please check your email to verify your account.',
        'user_id' => $user_id,
    ], 200);
}

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/register', [
        'methods' => 'POST',
        'callback' => 'custom_user_registration',
        'permission_callback' => '__return_true',
    ]);
});

// ============================================
// VERIFY EMAIL
// ============================================
function verify_user_email(WP_REST_Request $request)
{
    $email = sanitize_email($request->get_param('email'));
    $token = sanitize_text_field($request->get_param('token'));

    if (!$email || !$token) {
        return new WP_Error('missing_params', 'Email and token are required', ['status' => 400]);
    }

    $user = get_user_by('email', $email);
    if (!$user) {
        return new WP_Error('user_not_found', 'User not found', ['status' => 404]);
    }

    $stored_token = get_user_meta($user->ID, 'verification_token', true);
    if ($stored_token !== $token) {
        return new WP_Error('invalid_token', 'Invalid verification token', ['status' => 400]);
    }

    // Mark user as verified
    update_user_meta($user->ID, 'is_verified', true);
    delete_user_meta($user->ID, 'verification_token');

    return new WP_REST_Response([
        'message' => 'Email verified successfully! You can now log in.',
    ], 200);
}

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/verify-email', [
        'methods' => 'GET',
        'callback' => 'verify_user_email',
        'permission_callback' => '__return_true',
    ]);
});

// ============================================
// RESEND VERIFICATION EMAIL
// ============================================
function resend_verification_email(WP_REST_Request $request)
{
    $user = wp_get_current_user();

    if (!$user || !$user->exists()) {
        return new WP_Error('not_logged_in', 'User must be logged in', ['status' => 401]);
    }

    $is_verified = get_user_meta($user->ID, 'is_verified', true);
    if ($is_verified) {
        return new WP_REST_Response([
            'message' => 'Your account is already verified.',
        ], 200);
    }

    $verification_token = get_user_meta($user->ID, 'verification_token', true);
    if (!$verification_token) {
        $verification_token = wp_generate_password(32, false);
        update_user_meta($user->ID, 'verification_token', $verification_token);
    }

    $verify_link = get_site_url() . "/wp-json/custom/v1/verify-email?token=$verification_token&email=" . urlencode($user->user_email);
    $subject = 'Verify Your Account';
    $message = "Click the link below to verify your email address:\n\n$verify_link";

    $email_sent = wp_mail($user->user_email, $subject, $message);

    if ($email_sent) {
        return new WP_REST_Response([
            'message' => 'Verification email sent!',
        ], 200);
    }

    return new WP_Error('email_failed', 'Failed to send verification email', ['status' => 500]);
}

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/resend-verification', [
        'methods' => 'POST',
        'callback' => 'resend_verification_email',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
    ]);
});

// ============================================
// EXPOSE is_verified IN REST API USER RESPONSE
// ============================================
function expose_is_verified_in_api($response, $user, $request)
{
    $response->data['roles'] = array_values($user->roles);
    $response->data['is_verified'] = get_user_meta($user->ID, 'is_verified', true);
    return $response;
}
add_filter('rest_prepare_user', 'expose_is_verified_in_api', 10, 3);

// ============================================
// INCLUDE is_verified IN JWT LOGIN RESPONSE
// ============================================
function add_is_verified_to_jwt_response($data, $user)
{
    $data['is_verified'] = get_user_meta($user->ID, 'is_verified', true);
    // Include user roles in JWT response
    $data['roles'] = array_values($user->roles);
    return $data;
}
add_filter('jwt_auth_token_before_dispatch', 'add_is_verified_to_jwt_response', 10, 2);

// ============================================
// CUSTOM JWT LOGIN - WordPress User Management
// ============================================
function custom_jwt_login(WP_REST_Request $request)
{
    $params = $request->get_json_params();

    if (empty($params['username']) || empty($params['password'])) {
        return new WP_Error('missing_fields', 'Username and password are required', ['status' => 400]);
    }

    // Forward to official JWT endpoint
    $response = wp_remote_post(
        rest_url('jwt-auth/v1/token'),
        [
            'headers' => ['Content-Type' => 'application/json'],
            'body'    => wp_json_encode([
                'username' => $params['username'],
                'password' => $params['password'],
            ]),
        ]
    );

    if (is_wp_error($response)) {
        return new WP_Error('jwt_error', 'JWT request failed', ['status' => 500]);
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);

    if (empty($body['token'])) {
        return new WP_Error('invalid_credentials', 'Invalid username or password', ['status' => 401]);
    }

    return rest_ensure_response($body);
}

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/login', [
        'methods' => 'POST',
        'callback' => 'custom_jwt_login',
        'permission_callback' => '__return_true',
    ]);
});

// ============================================
// CHECK TOKEN VALIDITY
// ============================================
function custom_check_jwt(WP_REST_Request $request)
{
    $auth_header = $request->get_header('Authorization');
    if (!$auth_header || !preg_match('/Bearer\s+(.+)$/', $auth_header, $matches)) {
        return new WP_Error('missing_token', 'No token provided', ['status' => 401]);
    }

    $token = $matches[1];
    $user = wp_get_current_user();

    if (!$user || !$user->exists()) {
        return new WP_Error('invalid_token', 'Invalid token', ['status' => 401]);
    }

    return new WP_REST_Response([
        'success' => true,
        'user' => [
            'id' => $user->ID,
            'username' => $user->user_login,
            'email' => $user->user_email,
            'roles' => array_values($user->roles),
        ],
    ], 200);
}

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/check-token', [
        'methods' => 'POST',
        'callback' => 'custom_check_jwt',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
    ]);
});













add_filter('rest_user_query', function ($prepared_args, $request) {
    if ($request->get_route() === '/wp/v2/users/me') {
        return $prepared_args;
    }
    return $prepared_args;
}, 10, 2);

add_filter('rest_user_collection_params', function ($params) {
    return $params;
}, 10, 1);



add_filter('rest_authentication_errors', function ($result) {
    if (!empty($result)) {
        return $result;
    }

    if (str_contains($_SERVER['REQUEST_URI'] ?? '', '/wp/v2/users/me')) {
        if (!is_user_logged_in()) {
            return new WP_Error(
                'rest_not_logged_in',
                'Authentication required',
                ['status' => 401]
            );
        }
    }

    return $result;
});
