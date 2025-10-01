# PHP/MySQL Backend for Waste Management System

A REST API backend built with PHP and MySQL that serves as an alternative to Supabase for the waste management system.

## Features

- JWT-based authentication
- Customer management
- Service plans and subscriptions
- Waste collection scheduling
- RESTful API architecture
- CORS support
- Secure password hashing
- Input validation and sanitization

## Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache web server (with mod_rewrite enabled)
- Composer

## Installation

### 1. Install Dependencies

```bash
cd php-backend
composer install
```

### 2. Database Setup

Create the database and tables using the provided schema:

```bash
mysql -u root -p < database/schema.sql
```

Or manually:

```bash
mysql -u root -p
source database/schema.sql
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=waste_management
DB_USER=your_db_user
DB_PASSWORD=your_db_password

JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRY=86400

CORS_ORIGIN=http://localhost:5173
ENVIRONMENT=development
```

### 4. Web Server Configuration

#### Apache

Point your document root to the `public` directory. The `.htaccess` file is already configured.

Example virtual host configuration:

```apache
<VirtualHost *:80>
    ServerName api.waste-management.local
    DocumentRoot /path/to/php-backend/public

    <Directory /path/to/php-backend/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

#### PHP Built-in Server (Development Only)

```bash
cd public
php -S localhost:8000
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires authentication)

### Customers

- `GET /api/customers` - Get customer profile (requires authentication)
- `PUT /api/customers` - Update customer profile (requires authentication)

### Service Plans

- `GET /api/service-plans` - Get all active service plans
- `GET /api/service-plans/{id}` - Get specific service plan

### Subscriptions

- `GET /api/subscriptions` - Get customer subscriptions (requires authentication)
- `POST /api/subscriptions` - Create new subscription (requires authentication)
- `PUT /api/subscriptions/{id}` - Update subscription (requires authentication)

### Waste Collections

- `GET /api/collections` - Get customer collections (requires authentication)
- `POST /api/collections/schedule` - Schedule new collection (requires authentication)
- `PUT /api/collections/{id}` - Update collection status (requires authentication)

## API Usage Examples

### Register User

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "address": "123 Main St"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Service Plans

```bash
curl -X GET http://localhost:8000/api/service-plans
```

### Get Customer Profile (Authenticated)

```bash
curl -X GET http://localhost:8000/api/customers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Schedule Collection (Authenticated)

```bash
curl -X POST http://localhost:8000/api/collections/schedule \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduled_date": "2025-10-15 09:00:00",
    "waste_type": "general",
    "estimated_weight": 50.5,
    "notes": "Please collect from back entrance"
  }'
```

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message"
}
```

## Security Features

- Password hashing using bcrypt
- JWT token authentication
- SQL injection prevention using prepared statements
- Input sanitization and validation
- CORS protection
- Environment-based configuration

## Project Structure

```
php-backend/
├── config/
│   └── database.php          # Database connection
├── database/
│   └── schema.sql            # Database schema
├── public/
│   ├── .htaccess            # Apache configuration
│   └── index.php            # API entry point
├── src/
│   ├── controllers/         # Request handlers
│   │   ├── AuthController.php
│   │   ├── CustomerController.php
│   │   ├── ServicePlanController.php
│   │   ├── SubscriptionController.php
│   │   └── WasteCollectionController.php
│   ├── models/             # Database models
│   │   ├── User.php
│   │   ├── Customer.php
│   │   ├── ServicePlan.php
│   │   ├── Subscription.php
│   │   └── WasteCollection.php
│   ├── middleware/         # Middleware
│   │   ├── AuthMiddleware.php
│   │   └── CorsMiddleware.php
│   └── utils/             # Utilities
│       ├── JWT.php
│       └── Response.php
├── .env.example           # Environment template
├── .gitignore
├── composer.json          # Dependencies
└── README.md
```

## Development

### Testing

You can test the API using tools like:
- Postman
- Insomnia
- cURL
- HTTPie

### Debugging

Enable error reporting in development by setting in `.env`:

```
ENVIRONMENT=development
```

In `public/index.php`, add for development:

```php
if (getenv('ENVIRONMENT') === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}
```

## Production Deployment

1. Set environment to production in `.env`
2. Generate a strong JWT secret key
3. Disable error display
4. Enable HTTPS
5. Configure proper database credentials
6. Set appropriate file permissions
7. Enable PHP OPcache
8. Configure rate limiting (recommended)

## License

MIT License
