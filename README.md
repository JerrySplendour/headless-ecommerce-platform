# Toyfront Ecommerce - Headless WordPress/WooCommerce Platform

A modern, headless ecommerce platform built with React + TypeScript that connects to WordPress + WooCommerce as the backend API. This is a complete Bumpa replacement with full store management capabilities.

## Features

### Public Storefront
- Homepage with hero section and featured products
- Product catalog with filtering and search
- Detailed product pages with image gallery
- Shopping cart and checkout flow
- Responsive design for mobile and desktop

### Admin Dashboard
- Comprehensive overview with key metrics
- Order management (Website, Walk-in, Instagram, WhatsApp)
- Product and inventory management
- Customer CRM with segmentation
- Analytics and reporting
- Marketing campaigns and discount codes
- Point of Sale (POS) system
- Staff management with role-based access

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Routing**: React Router 7
- **State Management**: Zustand, TanStack Query
- **Styling**: Tailwind CSS, shadcn/ui
- **Charts**: Chart.js, React ChartJS 2
- **Backend API**: WordPress REST API + WooCommerce REST API

## Prerequisites

- Node.js 18+ and npm/yarn
- WordPress site with WooCommerce installed
- WooCommerce REST API credentials

## Installation

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd toyfront-ecommerce
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. **Configure environment variables**
\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` and add your WordPress/WooCommerce credentials:
\`\`\`env
VITE_API_BASE_URL=https://your-wordpress-site.com/wp-json
VITE_WC_CONSUMER_KEY=ck_your_consumer_key_here
VITE_WC_CONSUMER_SECRET=cs_your_consumer_secret_here
\`\`\`

4. **Start development server**
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

The app will open at `http://localhost:3000`

## Building for Production

To build the static version for deployment:

\`\`\`bash
npm run build
# or
yarn build
\`\`\`

The built files will be in the `dist` folder.

To preview the production build locally:
\`\`\`bash
npm run preview
# or
yarn preview
\`\`\`

## WordPress Setup

### 1. Install Required Plugins
- WooCommerce
- JWT Authentication for WP REST API (for user authentication)

### 2. Generate WooCommerce API Keys

1. Go to WooCommerce → Settings → Advanced → REST API
2. Click "Add Key"
3. Set permissions to "Read/Write"
4. Copy the Consumer Key and Consumer Secret
5. Add them to your `.env` file

### 3. Configure Permalinks

Go to Settings → Permalinks and ensure you're using "Post name" or any option other than "Plain".

### 4. Enable CORS (if needed)

Add to your WordPress theme's `functions.php`:

\`\`\`php
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
        return $value;
    });
}, 15);
\`\`\`

## Project Structure

\`\`\`
src/
├── api/              # API service modules
│   ├── auth.ts
│   ├── products.ts
│   ├── orders.ts
│   ├── customers.ts
│   ├── analytics.ts
│   ├── campaigns.ts
│   ├── inventory.ts
│   ├── staff.ts
│   └── pos.ts
├── components/       # Reusable components
├── layouts/          # Layout components
│   ├── PublicLayout.tsx
│   └── DashboardLayout.tsx
├── pages/            # Page components
│   ├── public/       # Storefront pages
│   ├── dashboard/    # Admin pages
│   └── auth/         # Authentication pages
├── store/            # Zustand state management
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── config/           # Configuration files
└── main.tsx          # Application entry point
\`\`\`

## Key Features Implementation

### Authentication
- JWT-based authentication with WordPress
- Protected routes for admin dashboard
- Role-based access control (Admin, Manager, Staff)

### Sales Channels
- Website orders
- Walk-in (POS) orders
- Instagram orders
- WhatsApp orders

### Inventory Management
- Real-time stock tracking
- Low stock alerts
- Bulk stock updates
- Stock history (requires custom WordPress plugin)

### Customer Segmentation
- VIP: ₦500,000+ total spend
- Premium: ₦100,000 - ₦499,999
- Regular: ₦10,000 - ₦99,999
- New: < ₦10,000

### Analytics
- Revenue tracking
- Sales by channel
- Customer growth
- Top products
- Order statistics

## API Endpoints Used

### WooCommerce REST API
- `GET /wc/v3/products` - List products
- `POST /wc/v3/products` - Create product
- `PUT /wc/v3/products/:id` - Update product
- `GET /wc/v3/orders` - List orders
- `POST /wc/v3/orders` - Create order
- `PUT /wc/v3/orders/:id` - Update order
- `GET /wc/v3/customers` - List customers
- `GET /wc/v3/reports/sales` - Sales reports
- `POST /wc/v3/coupons` - Create discount codes

### WordPress REST API
- `POST /jwt-auth/v1/token` - User login
- `GET /wp/v2/users` - List users (staff)
- `POST /wp/v2/users` - Create user

## Deployment

### Static Export (WordPress Theme)
1. Build the project: `npm run build`
2. Copy the `dist` folder contents to your WordPress theme
3. Update your theme to serve the React app

### Vercel/Netlify
1. Connect your repository
2. Set environment variables
3. Deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.
\`\`\`

```file=".gitignore"
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build
/dist

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Temporary files
*.tmp
*.temp

# Build files
*.tsbuildinfo

# OS files
Thumbs.db
