# API Integration Guide

This document explains how the frontend React app integrates with WordPress + WooCommerce backend.

## Architecture Overview

\`\`\`
React Frontend (Vite) ←→ WordPress REST API ←→ WooCommerce + Custom CPTs
\`\`\`

- **Frontend**: React + TypeScript + Vite + React Router
- **Backend**: WordPress + WooCommerce + Custom Post Types
- **Communication**: REST API with JSON

## Authentication

### WooCommerce Basic Auth
For WooCommerce endpoints, we use Consumer Key and Secret:

\`\`\`typescript
const auth = {
  username: import.meta.env.VITE_WC_CONSUMER_KEY,
  password: import.meta.env.VITE_WC_CONSUMER_SECRET,
};

axios.get('/wc/v3/products', { auth });
\`\`\`

### WordPress JWT (for custom endpoints)
For admin dashboard and custom endpoints:

\`\`\`typescript
// Login
const response = await axios.post('/jwt-auth/v1/token', {
  username: 'admin',
  password: 'password',
});

const token = response.data.token;

// Use token
axios.get('/custom/v1/staff/', {
  headers: { Authorization: `Bearer ${token}` }
});
\`\`\`

## API Modules

### Products (`src/api/products.ts`)

\`\`\`typescript
// Get all products
const products = await getProducts();

// Get single product
const product = await getProduct(123);

// Create product
const newProduct = await createProduct({
  name: 'T-Shirt',
  price: '29.99',
  stock_quantity: 100,
});

// Update product
await updateProduct(123, { stock_quantity: 90 });
\`\`\`

### Orders (`src/api/orders.ts`)

\`\`\`typescript
// Get orders with channel filter
const orders = await getOrders({ channel: 'instagram' });

// Create order
const order = await createOrder({
  line_items: [
    { product_id: 123, quantity: 2 }
  ],
  billing: { /* ... */ },
  sales_channel: 'walk-in',
});

// Update order status
await updateOrderStatus(456, 'completed');
\`\`\`

### Customers (`src/api/customers.ts`)

\`\`\`typescript
// Get customers
const customers = await getCustomers();

// Get customer with orders
const customer = await getCustomer(789);

// Create customer
const newCustomer = await createCustomer({
  email: 'user@example.com',
  first_name: 'John',
  last_name: 'Doe',
});
\`\`\`

### Staff (`src/api/staff.ts`)

\`\`\`typescript
// Get staff members
const staff = await getStaff();

// Create staff member
const member = await createStaffMember({
  name: 'Jane Smith',
  email: 'jane@example.com',
  role: 'manager',
  permissions: ['orders', 'products'],
});

// Delete staff member
await deleteStaffMember(123);
\`\`\`

### Analytics (`src/api/analytics.ts`)

\`\`\`typescript
// Get analytics data
const analytics = await getAnalytics({
  start_date: '2024-01-01',
  end_date: '2024-01-31',
});

// Returns:
// {
//   total_revenue: 15000,
//   total_orders: 150,
//   average_order_value: 100,
//   sales_by_channel: { ... },
//   top_products: [ ... ]
// }
\`\`\`

### Campaigns (`src/api/campaigns.ts`)

\`\`\`typescript
// Get coupons (campaigns)
const campaigns = await getCampaigns();

// Create campaign
const campaign = await createCampaign({
  code: 'SUMMER2024',
  discount_type: 'percent',
  amount: '20',
  expiry_date: '2024-08-31',
});

// Track campaign usage
const stats = await getCampaignStats('SUMMER2024');
\`\`\`

### Inventory (`src/api/inventory.ts`)

\`\`\`typescript
// Get inventory status
const inventory = await getInventory();

// Update stock
await updateStock(productId, 50);

// Get low stock alerts
const lowStock = await getLowStockProducts(threshold: 10);
\`\`\`

### POS (`src/api/pos.ts`)

\`\`\`typescript
// Start POS session
const session = await createPOSSession({
  staff_id: 123,
  staff_name: 'John Doe',
  opening_cash: 100,
});

// Close session
await closePOSSession(sessionId, {
  closing_cash: 500,
  total_sales: 400,
});

// Get active sessions
const sessions = await getPOSSessions({ status: 'open' });
\`\`\`

## State Management with Zustand

### Auth Store (`src/store/authStore.ts`)

\`\`\`typescript
const { user, login, logout } = useAuthStore();

// Login
await login('username', 'password');

// Check if authenticated
if (user) {
  // User is logged in
}

// Logout
logout();
\`\`\`

### Cart Store (`src/store/cartStore.ts`)

\`\`\`typescript
const { items, addItem, removeItem, updateQuantity, clearCart } = useCartStore();

// Add to cart
addItem(product, 2);

// Update quantity
updateQuantity(productId, 3);

// Get total
const total = items.reduce((sum, item) => 
  sum + (item.price * item.quantity), 0
);
\`\`\`

## Error Handling

All API calls include error handling:

\`\`\`typescript
try {
  const data = await getProducts();
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
    } else if (error.response?.status === 404) {
      // Not found
    } else {
      // Other errors
      console.error(error.response?.data?.message);
    }
  }
}
\`\`\`

## Data Flow Examples

### Creating an Order (E-commerce Flow)

1. Customer adds products to cart
2. Cart stored in Zustand state
3. Customer proceeds to checkout
4. Frontend calls `createOrder()` with cart items
5. WooCommerce creates order in WordPress database
6. Order confirmation returned to frontend
7. Cart cleared

### Processing POS Sale

1. Staff logs in to dashboard
2. Staff starts POS session
3. Staff adds products to POS cart
4. Staff completes sale
5. Frontend creates order with `sales_channel: 'walk-in'`
6. Order added to POS session
7. Session stats updated

### Tracking Analytics

1. Admin opens analytics page
2. Frontend calls `getAnalytics()` with date range
3. WordPress queries WooCommerce orders
4. Data aggregated by channel, product, etc.
5. Charts rendered with processed data

## Testing API Endpoints

### Using cURL

\`\`\`bash
# Get products
curl -u ck_xxx:cs_xxx \
  https://yoursite.com/wp-json/wc/v3/products

# Create order
curl -X POST \
  https://yoursite.com/wp-json/wc/v3/orders \
  -u ck_xxx:cs_xxx \
  -H 'Content-Type: application/json' \
  -d '{
    "line_items": [{"product_id": 123, "quantity": 2}],
    "billing": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com"
    }
  }'
\`\`\`

### Using Postman

1. Create a new request
2. Set Authorization to Basic Auth
3. Username: Consumer Key
4. Password: Consumer Secret
5. Send request

## Performance Optimization

### Caching
- Implement Redis or object caching in WordPress
- Use SWR or React Query for client-side caching

### Pagination
\`\`\`typescript
const products = await getProducts({ 
  page: 1, 
  per_page: 20 
});
\`\`\`

### Lazy Loading
- Load data only when needed
- Use React.lazy() for code splitting

## Security Best Practices

1. **Never expose API keys in client code**
2. **Use environment variables for sensitive data**
3. **Validate all inputs on backend**
4. **Use HTTPS in production**
5. **Implement rate limiting**
6. **Sanitize user inputs**
7. **Use Content Security Policy headers**

## Deployment Checklist

- [ ] Set production API URL in `.env`
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up API key rotation
- [ ] Enable WordPress security plugins
- [ ] Set up monitoring and logging
- [ ] Test all API endpoints
- [ ] Configure CDN for static assets
- [ ] Enable gzip compression
- [ ] Set up automated backups
