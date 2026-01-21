<?php
/**
 * Headless Ecommerce Theme Functions
 * Main theme functions file for the WordPress theme
 * This file includes CORS headers, CPT registration, JWT auth, and React app enqueuing
 */



// ============================================
// HARD CORS PRE-FLIGHT FIX (REQUIRED)
// ============================================
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    $allowed_origins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://yourdomain.com',
        'https://app.yourdomain.com'
    ];

    if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins, true)) {
        header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
        header('Access-Control-Allow-Credentials: true');
    }

    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With');
    header('Access-Control-Max-Age: 86400');

    http_response_code(200);
    exit;
}

// ============================================
// CORS Headers Setup
// ============================================
add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function ($value) {
        $allowed_origins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'https://yourdomain.com',
            'https://app.yourdomain.com'
        ];

        if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
            header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
            header('Access-Control-Allow-Credentials: true');
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With');

        return $value;
    });
}, 15);

// ============================================
// CPT Auto-loading
// ============================================
foreach (glob(get_template_directory() . '/cpts/*.php') as $file) {
    require_once $file;
}

// ============================================
// React App Enqueuing
// ============================================
function enqueue_react_app()
{
    $theme_directory = get_template_directory() . '/react-tc/build/static/';
    $theme_url = get_template_directory_uri() . '/react-tc/build/static/';

    // Find dynamically named JavaScript file
    $js_files = glob($theme_directory . 'js/main.*.js');
    $js_url = $js_files ? $theme_url . 'js/' . basename($js_files[0]) : '';

    // Find dynamically named CSS file
    $css_files = glob($theme_directory . 'css/main.*.css');
    $css_url = $css_files ? $theme_url . 'css/' . basename($css_files[0]) : '';

    // Enqueue JavaScript
    if ($js_url) {
        wp_enqueue_script(
            'react-app',
            $js_url,
            array(),
            null,
            true
        );

        // Pass WordPress data to React app
        wp_localize_script('react-app', 'wpData', array(
            'pageId'   => get_queried_object_id(),
            'slug'     => get_post_field('post_name', get_queried_object_id()),
            'pageTitle' => get_the_title(),
            'siteUrl'  => get_site_url(),
            'apiUrl'   => rest_url(),
        ));
    }

    // Enqueue CSS
    if ($css_url) {
        wp_enqueue_style(
            'react-app-css',
            $css_url,
            array(),
            null
        );
    }
}
add_action('wp_enqueue_scripts', 'enqueue_react_app');

// ============================================
// Create Default Pages on Theme Activation
// ============================================
function create_default_pages_on_theme_activation()
{
    $pages = [
        [
            'title' => 'Home',
            'slug'  => 'home',
        ],
        [
            'title' => 'Shop',
            'slug'  => 'shop',
        ],
        [
            'title' => 'Cart',
            'slug'  => 'cart',
        ],
        [
            'title' => 'Checkout',
            'slug'  => 'checkout',
        ],
        [
            'title' => 'Dashboard',
            'slug'  => 'dashboard',
        ],
        [
            'title' => 'Account',
            'slug'  => 'account',
        ],
    ];

    foreach ($pages as $page) {
        if (!get_page_by_path($page['slug'])) {
            wp_insert_post([
                'post_title'   => $page['title'],
                'post_name'    => $page['slug'],
                'post_content' => '',
                'post_status'  => 'publish',
                'post_type'    => 'page',
                'post_author'  => 1,
            ]);
        }
    }
}
add_action('after_switch_theme', 'create_default_pages_on_theme_activation');

// ============================================
// Utility Functions
// ============================================
function cc_return_error($msg, $code = 400) {
    return new WP_REST_Response(['error' => $msg], $code);
}

function cc_get_param($arr, $key, $default = '') {
    return isset($arr[$key]) ? $arr[$key] : $default;
}

// ============================================
// Media Upload Helpers
// ============================================
function save_base64_image_to_media_library($base64_image, $post_id = 0)
{
    if (preg_match('/^data:image\/(\w+);base64,/', $base64_image, $type)) {
        $data = substr($base64_image, strpos($base64_image, ',') + 1);
        $type = strtolower($type[1]);
        if (!in_array($type, ['jpg', 'jpeg', 'png', 'gif'])) {
            return new WP_Error('invalid_image_type', 'Image type not allowed.', ['status' => 400]);
        }
        $data = base64_decode($data);
        if ($data === false) {
            return new WP_Error('base64_decode_failed', 'Base64 decoding failed.', ['status' => 400]);
        }
    } else {
        return new WP_Error('invalid_format', 'Invalid image format.', ['status' => 400]);
    }

    $upload_dir = wp_upload_dir();
    $file_name = uniqid() . '.' . $type;
    $file_path = $upload_dir['path'] . '/' . $file_name;

    file_put_contents($file_path, $data);
    $file_type = wp_check_filetype($file_name, null);

    $attachment = [
        'post_mime_type' => $file_type['type'],
        'post_title'     => sanitize_file_name($file_name),
        'post_content'   => '',
        'post_status'    => 'inherit'
    ];

    $attach_id = wp_insert_attachment($attachment, $file_path, $post_id);
    require_once(ABSPATH . 'wp-admin/includes/image.php');
    $attach_data = wp_generate_attachment_metadata($attach_id, $file_path);
    wp_update_attachment_metadata($attach_id, $attach_data);

    return $attach_id;
}

function save_base64_file_to_media_library($base64_file, $post_id = 0, $mediaType = 'image')
{
    $allowed_types = [
        'image' => ['image/jpeg', 'image/png', 'image/gif'],
        'video' => ['video/mp4', 'video/webm', 'video/ogg'],
        'audio' => ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    ];

    if (!isset($allowed_types[$mediaType])) {
        return new WP_Error('invalid_media_type', 'Unsupported media type.', ['status' => 400]);
    }

    if (preg_match('/^data:(\w+\/[\w\-\+\.]+);base64,/', $base64_file, $matches)) {
        $mime_type = strtolower($matches[1]);
        $data = substr($base64_file, strpos($base64_file, ',') + 1);
        $data = base64_decode($data);
        if ($data === false) {
            return new WP_Error('base64_decode_failed', 'Base64 decoding failed.', ['status' => 400]);
        }
    } else {
        return new WP_Error('invalid_format', 'Invalid base64 format.', ['status' => 400]);
    }

    if (!in_array($mime_type, $allowed_types[$mediaType], true)) {
        return new WP_Error('invalid_mime', "File type not allowed for mediaType {$mediaType}.", ['status' => 400]);
    }

    $mime_to_ext = [
        'image/jpeg'  => 'jpg',
        'image/png'   => 'png',
        'image/gif'   => 'gif',
        'video/mp4'   => 'mp4',
        'audio/mpeg'  => 'mp3',
        'audio/wav'   => 'wav',
    ];

    $ext = $mime_to_ext[$mime_type] ?? '';
    if (!$ext) {
        return new WP_Error('invalid_extension', 'Could not determine file extension.', ['status' => 400]);
    }

    $upload_dir = wp_upload_dir();
    $file_name = uniqid() . '.' . $ext;
    $file_path = $upload_dir['path'] . '/' . $file_name;

    file_put_contents($file_path, $data);
    $file_type = wp_check_filetype($file_name, null);

    $attachment = [
        'post_mime_type' => $file_type['type'],
        'post_title'     => sanitize_file_name($file_name),
        'post_content'   => '',
        'post_status'    => 'inherit'
    ];

    $attach_id = wp_insert_attachment($attachment, $file_path, $post_id);
    require_once(ABSPATH . 'wp-admin/includes/image.php');
    $attach_data = wp_generate_attachment_metadata($attach_id, $file_path);
    wp_update_attachment_metadata($attach_id, $attach_data);

    return $attach_id;
}

function cc_handle_file_upload($field, $post_id, $old_meta_key) {
    if (!isset($_FILES[$field]) || empty($_FILES[$field]['tmp_name'])) {
        return null;
    }

    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';

    $old = get_post_meta($post_id, $old_meta_key, true);
    if ($old && is_numeric($old)) {
        wp_delete_attachment(intval($old), true);
    }

    $attach_id = media_handle_upload($field, $post_id);
    if (is_wp_error($attach_id)) {
        return $attach_id;
    }

    update_post_meta($post_id, $old_meta_key, $attach_id);
    return $attach_id;
}
/**
 * End of functions.php
 */
