# WordPress Backend Installation Guide

This guide will help you set up the WordPress + WooCommerce backend for your headless ecommerce platform.

## Prerequisites

- WordPress 6.0 or higher
- WooCommerce 8.0 or higher
- PHP 7.4 or higher
- MySQL 5.7 or higher

## Step 1: Install Required Plugins

1. **WooCommerce**: Install and activate WooCommerce from the WordPress plugin directory
2. **WooCommerce REST API**: Already included with WooCommerce

## Step 2: Enable REST API

1. Go to **WooCommerce → Settings → Advanced → REST API**
2. Click **Add Key**
3. Fill in the details:
   - Description: `Headless Frontend`
   - User: Select your admin user
   - Permissions: `Read/Write`
4. Click **Generate API Key**
5. Copy the **Consumer Key** and **Consumer Secret** - you'll need these for your `.env` file

## Step 3: Install Custom Post Types

Copy all PHP files from the `docs/wordpress-cpts/` folder to your WordPress theme's `cpts/` directory:

\`\`\`
your-theme/
├── cpts/
│   ├── staff-members.php
│   ├── sales-channels.php
│   ├── customer-notes.php
│   ├── pos-sessions.php
│   └── woocommerce-extensions.php
└── functions.php
\`\`\`

### Ensure functions.php loads CPT files

Your theme's `functions.php` should already have:

\`\`\`php
foreach (glob(get_template_directory() . '/cpts/*.php') as $file) {
    require_once $file;
}
\`\`\`

If not, add this line to your `functions.php`.

## Step 4: Configure CORS (Cross-Origin Resource Sharing)

Add this to your theme's `functions.php` or create a custom plugin:

\`\`\`php
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
        return $value;
    });
}, 15);
\`\`\`

**Important**: In production, replace `*` with your actual frontend domain for security.

## Step 5: Set Permalink Structure

1. Go to **Settings → Permalinks**
2. Select **Post name** or any option except "Plain"
3. Click **Save Changes**

This ensures REST API routes work correctly.

## Step 6: Test API Endpoints

Use a tool like Postman or cURL to test your endpoints:

### Test WooCommerce Products
\`\`\`bash
curl -u consumer_key:consumer_secret \
  https://yoursite.com/wp-json/wc/v3/products
\`\`\`

### Test Custom Staff Endpoint
\`\`\`bash
curl -X GET \
  https://yoursite.com/wp-json/custom/v1/staff/ \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
\`\`\`

### Test Sales Channels
\`\`\`bash
curl https://yoursite.com/wp-json/custom/v1/sales-channels/
\`\`\`

## Step 7: Create Sample Data (Optional)

### Create Sample Products
1. Go to **Products → Add New**
2. Add product name, price, description, and image
3. Set stock quantity and SKU
4. Publish the product

### Initialize Sales Channels
The sales channels (Website, Instagram, WhatsApp, Walk-in) are created automatically when you first load the site after installing the CPT files.

### Create Staff Members
Use the REST API or add via WordPress admin:
\`\`\`bash
curl -X POST \
  https://yoursite.com/wp-json/custom/v1/staff/ \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "manager",
    "status": "active",
    "permissions": ["orders", "products", "customers"]
  }'
\`\`\`

## Step 8: Configure Frontend Environment

Create a `.env` file in your frontend project root:

\`\`\`env
VITE_API_BASE_URL=https://yoursite.com/wp-json
VITE_WC_CONSUMER_KEY=ck_your_consumer_key
VITE_WC_CONSUMER_SECRET=cs_your_consumer_secret
\`\`\`

## API Endpoints Reference

### WooCommerce (Built-in)
- `GET /wc/v3/products` - List products
- `GET /wc/v3/products/:id` - Get single product
- `POST /wc/v3/products` - Create product
- `PUT /wc/v3/products/:id` - Update product
- `DELETE /wc/v3/products/:id` - Delete product
- `GET /wc/v3/orders` - List orders
- `POST /wc/v3/orders` - Create order
- `GET /wc/v3/customers` - List customers
- `GET /wc/v3/coupons` - List coupons

### Custom Endpoints
- `GET /custom/v1/staff/` - List staff members
- `POST /custom/v1/staff/` - Create staff member
- `DELETE /custom/v1/staff/:id` - Delete staff member
- `GET /custom/v1/sales-channels/` - List sales channels
- `POST /custom/v1/sales-channels/` - Create sales channel
- `GET /custom/v1/customer-notes/` - List customer notes
- `POST /custom/v1/customer-notes/` - Create customer note
- `GET /custom/v1/pos-sessions/` - List POS sessions
- `POST /custom/v1/pos-sessions/` - Create/update POS session
- `GET /custom/v1/orders/?channel=instagram` - Get orders by channel
- `GET /custom/v1/analytics/` - Get analytics data

## Security Considerations

1. **Use HTTPS**: Always use HTTPS in production
2. **Secure API Keys**: Never commit API keys to version control
3. **CORS Configuration**: Restrict CORS to your frontend domain in production
4. **Authentication**: Use JWT tokens or OAuth for authenticated requests
5. **Rate Limiting**: Consider implementing rate limiting for API endpoints
6. **Input Validation**: All CPT files include input sanitization

## Troubleshooting

### 404 on REST API Routes
- Flush permalinks: Go to **Settings → Permalinks** and click **Save Changes**
- Check if WooCommerce is activated
- Verify .htaccess file has correct rewrite rules

### CORS Errors
- Ensure CORS headers are added in functions.php
- Check if your hosting provider blocks CORS
- Verify the frontend domain is allowed

### Authentication Issues
- Verify API keys are correct
- Check if user has proper permissions
- Ensure Authorization header is being sent

### CPT Files Not Loading
- Check if functions.php has the correct require_once loop
- Verify file permissions (should be 644)
- Check for PHP errors in error_log

## Need Help?

- WooCommerce Documentation: https://woocommerce.com/docs/
- WordPress REST API: https://developer.wordpress.org/rest-api/
- WooCommerce REST API: https://woocommerce.github.io/woocommerce-rest-api-docs/
