# WordPress Backend Setup Guide

This guide will help you set up the WordPress backend to work with the Toyfront Ecommerce frontend.

## Step 1: Install WordPress

1. Download WordPress from [wordpress.org](https://wordpress.org/download/)
2. Install on your hosting or use Local by Flywheel for local development
3. Complete the WordPress installation wizard

## Step 2: Install Required Plugins

### WooCommerce
1. Go to Plugins → Add New
2. Search for "WooCommerce"
3. Install and activate
4. Complete the WooCommerce setup wizard

### JWT Authentication
1. Download [JWT Authentication for WP REST API](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/)
2. Install and activate
3. Add to `wp-config.php`:
\`\`\`php
define('JWT_AUTH_SECRET_KEY', 'your-secret-key-here');
define('JWT_AUTH_CORS_ENABLE', true);
\`\`\`

## Step 3: Configure WooCommerce

### General Settings
1. Go to WooCommerce → Settings → General
2. Set your store address and currency
3. Save changes

### Product Settings
1. Go to WooCommerce → Settings → Products
2. Enable "Manage stock"
3. Set low stock threshold (default: 2)
4. Save changes

### Generate API Keys
1. Go to WooCommerce → Settings → Advanced → REST API
2. Click "Add Key"
3. Description: "Toyfront Frontend"
4. User: Select admin user
5. Permissions: Read/Write
6. Click "Generate API Key"
7. **Important**: Copy the Consumer Key and Consumer Secret immediately
8. Add them to your frontend `.env` file

## Step 4: Configure Permalinks

1. Go to Settings → Permalinks
2. Select "Post name" or "Custom Structure"
3. Save changes
4. This ensures REST API endpoints work properly

## Step 5: Enable CORS

Add this to your theme's `functions.php` or create a custom plugin:

\`\`\`php
<?php
/**
 * Enable CORS for REST API
 */
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WC-Store-API-Nonce');
        
        if ('OPTIONS' === $_SERVER['REQUEST_METHOD']) {
            status_header(200);
            exit();
        }
        
        return $value;
    });
}, 15);

/**
 * Add sales channel meta to orders
 */
add_filter('woocommerce_rest_prepare_shop_order_object', function($response, $order) {
    $response->data['sales_channel'] = $order->get_meta('_sales_channel', true) ?: 'website';
    return $response;
}, 10, 2);
\`\`\`

## Step 6: Create Sample Data (Optional)

### Add Products
1. Go to Products → Add New
2. Create at least 5-10 products with:
   - Title
   - Description
   - Price
   - Stock quantity
   - Images
   - Categories

### Add Categories
1. Go to Products → Categories
2. Create categories like:
   - Electronics
   - Clothing
   - Home & Garden
   - Sports

## Step 7: Create Staff Users

1. Go to Users → Add New
2. Create users with different roles:
   - Administrator (full access)
   - Shop Manager (manage orders, products)
   - Shop Staff (view only)

## Step 8: Test API Endpoints

Test that your API is working:

### Test Products Endpoint
\`\`\`bash
curl https://your-site.com/wp-json/wc/v3/products \
  -u consumer_key:consumer_secret
\`\`\`

### Test Orders Endpoint
\`\`\`bash
curl https://your-site.com/wp-json/wc/v3/orders \
  -u consumer_key:consumer_secret
\`\`\`

If you see JSON data, your API is working correctly!

## Step 9: Security Recommendations

1. **Use HTTPS**: Always use SSL certificate in production
2. **Strong passwords**: Use strong passwords for all users
3. **Limit API permissions**: Only grant necessary permissions
4. **Regular backups**: Use a backup plugin like UpdraftPlus
5. **Keep updated**: Always update WordPress, WooCommerce, and plugins

## Custom Endpoints (Optional)

To support all Toyfront features, you may need custom endpoints:

### Analytics Endpoint
\`\`\`php
add_action('rest_api_init', function() {
    register_rest_route('toyfront/v1', '/analytics', array(
        'methods' => 'GET',
        'callback' => 'toyfront_get_analytics',
        'permission_callback' => function() {
            return current_user_can('manage_woocommerce');
        }
    ));
});

function toyfront_get_analytics($request) {
    global $wpdb;
    
    $from_date = $request->get_param('from') ?: date('Y-m-d', strtotime('-30 days'));
    $to_date = $request->get_param('to') ?: date('Y-m-d');
    
    // Get revenue data
    $orders = wc_get_orders(array(
        'date_created' => $from_date . '...' . $to_date,
        'status' => array('completed', 'processing'),
        'limit' => -1
    ));
    
    $total_revenue = 0;
    $total_orders = count($orders);
    
    foreach ($orders as $order) {
        $total_revenue += $order->get_total();
    }
    
    return array(
        'total_revenue' => $total_revenue,
        'total_orders' => $total_orders,
        'average_order_value' => $total_orders > 0 ? $total_revenue / $total_orders : 0,
        'period' => array(
            'from' => $from_date,
            'to' => $to_date
        )
    );
}
\`\`\`

### Sales Channel Meta
Add this to save sales channel with orders:

\`\`\`php
add_action('woocommerce_new_order', function($order_id) {
    $order = wc_get_order($order_id);
    $channel = isset($_POST['sales_channel']) ? sanitize_text_field($_POST['sales_channel']) : 'website';
    $order->update_meta_data('_sales_channel', $channel);
    $order->save();
});
\`\`\`

## Troubleshooting

### Issue: "401 Unauthorized"
- Check your API keys are correct
- Ensure Basic Authentication is working
- Verify CORS headers are set

### Issue: "404 Not Found"
- Check permalinks are set to "Post name"
- Ensure .htaccess is writable
- Try resaving permalinks

### Issue: CORS errors
- Add CORS headers to functions.php
- Check server configuration
- Verify REST API is not blocked

### Issue: Products not showing
- Ensure products are published
- Check stock status is "In stock"
- Verify API credentials

## Next Steps

Once your WordPress backend is set up:

1. Copy the API credentials to your frontend `.env` file
2. Run `npm run dev` in your frontend project
3. Test the connection by viewing products
4. Start managing your store!

## Support Resources

- [WooCommerce REST API Documentation](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [JWT Authentication Plugin](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/)
