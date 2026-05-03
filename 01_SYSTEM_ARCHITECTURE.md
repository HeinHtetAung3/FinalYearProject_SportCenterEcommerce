# Sports Equipment E-commerce Platform
## Complete System Architecture & Implementation Guide

---

## 📐 1. SYSTEM ARCHITECTURE OVERVIEW

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND LAYER                              │
│              React (Vite) - SPA with Context API/Redux               │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Pages: Home | ProductList | ProductDetail | Cart | Checkout │   │
│  │ Login | Register | Profile | Admin Dashboard                │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Components: ProductCard | FilterSidebar | RatingStars        │   │
│  │ Pagination | SearchBar | ImageGallery | Loader               │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                               │
│          Request Validation | Rate Limiting | CORS Policy            │
└─────────────────────────────────────────────────────────────────────┘
                                ↕ REST
┌─────────────────────────────────────────────────────────────────────┐
│                     BACKEND SERVICE LAYER                            │
│                    Spring Boot (Java 21)                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Controllers: Auth | Product | Cart | Order | Review | User   │   │
│  │ Services: Business Logic & Transactions                       │   │
│  │ Repositories: Data Access Layer (JPA)                        │   │
│  │ DTOs: Request/Response Objects                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Security: JWT Authentication | Spring Security | BCrypt      │   │
│  │ Exception Handling | Global Error Handler                    │   │
│  │ Logging: SLF4J | Request/Response Logging                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                ↕
┌─────────────────────────────────────────────────────────────────────┐
│                      PERSISTENCE LAYER                               │
│  ┌─────────────────────┐          ┌──────────────────────────┐      │
│  │   MySQL Database    │          │   Redis Cache Layer      │      │
│  │   (Primary Store)   │          │   (Hot Data Cache)       │      │
│  │                     │          │                          │      │
│  │ - User              │          │ - Product Listings       │      │
│  │ - Product           │          │ - Popular Searches       │      │
│  │ - Cart              │          │ - User Sessions          │      │
│  │ - Order             │          │ - Rating Data            │      │
│  │ - Review            │          │ - Category Filters       │      │
│  │ - Wishlist          │          │                          │      │
│  │ - ProductImage      │          │ TTL: Configurable        │      │
│  │ - Category          │          │ Eviction: LRU            │      │
│  └─────────────────────┘          └──────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ 2. BACKEND STRUCTURE & PACKAGE DESIGN

### Package Organization (Clean Architecture)

```
com.sportsequip
├── config/                          # Configuration Classes
│   ├── SecurityConfig.java          # JWT & Spring Security Setup
│   ├── JwtConfig.java               # JWT Properties
│   ├── WebConfig.java               # CORS, WebMvc Config
│   └── CacheConfig.java             # Redis Configuration
│
├── controller/                      # REST API Controllers
│   ├── AuthController.java          # Login/Register/RefreshToken
│   ├── ProductController.java       # Product CRUD & Search
│   ├── CartController.java          # Cart Management
│   ├── OrderController.java         # Order Operations
│   ├── ReviewController.java        # Review & Rating
│   ├── WishlistController.java      # Wishlist Management
│   ├── UserController.java          # User Profile
│   └── AdminController.java         # Admin Dashboard
│
├── service/                         # Business Logic Layer
│   ├── AuthService.java             # Authentication Logic
│   ├── UserService.java             # User Management
│   ├── ProductService.java          # Product Operations
│   ├── CartService.java             # Cart Logic
│   ├── OrderService.java            # Order Processing
│   ├── ReviewService.java           # Review Management
│   ├── WishlistService.java         # Wishlist Operations
│   ├── ImageUploadService.java      # File Handling
│   ├── SearchService.java           # Search & Filtering
│   └── CacheService.java            # Cache Management
│
├── repository/                      # Data Access Layer (JPA)
│   ├── UserRepository.java
│   ├── ProductRepository.java       # Custom Queries
│   ├── CartRepository.java
│   ├── CartItemRepository.java
│   ├── OrderRepository.java
│   ├── OrderItemRepository.java
│   ├── ReviewRepository.java
│   ├── WishlistRepository.java
│   ├── ProductImageRepository.java
│   └── CategoryRepository.java
│
├── entity/                          # JPA Entities
│   ├── User.java
│   ├── Role.java
│   ├── Product.java
│   ├── ProductImage.java
│   ├── Category.java
│   ├── Cart.java
│   ├── CartItem.java
│   ├── Order.java
│   ├── OrderItem.java
│   ├── Review.java
│   └── Wishlist.java
│
├── dto/                             # Data Transfer Objects
│   ├── auth/
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   ├── AuthResponse.java
│   │   └── RefreshTokenRequest.java
│   ├── product/
│   │   ├── ProductRequest.java
│   │   ├── ProductResponse.java
│   │   ├── ProductDetailResponse.java
│   │   ├── ProductSearchResponse.java
│   │   └── ProductVariantDTO.java
│   ├── cart/
│   │   ├── CartItemRequest.java
│   │   ├── CartItemResponse.java
│   │   └── CartResponse.java
│   ├── order/
│   │   ├── OrderRequest.java
│   │   ├── OrderResponse.java
│   │   ├── OrderItemDTO.java
│   │   └── OrderStatusUpdate.java
│   ├── review/
│   │   ├── ReviewRequest.java
│   │   ├── ReviewResponse.java
│   │   └── RatingStatsDTO.java
│   ├── user/
│   │   ├── UserProfileDTO.java
│   │   └── UserUpdateRequest.java
│   └── common/
│       ├── PageResponse.java
│       ├── ApiResponse.java
│       └── ErrorResponse.java
│
├── exception/                       # Custom Exceptions & Handlers
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   ├── ValidationException.java
│   ├── UnauthorizedException.java
│   └── DuplicateResourceException.java
│
├── security/                        # Security Components
│   ├── JwtTokenProvider.java        # Token Generation/Validation
│   ├── JwtAuthenticationFilter.java # JWT Filter
│   ├── CustomUserDetailsService.java
│   └── SecurityUtil.java            # Security Helper Methods
│
├── mapper/                          # Entity ↔ DTO Mapping
│   ├── ProductMapper.java
│   ├── UserMapper.java
│   ├── OrderMapper.java
│   ├── ReviewMapper.java
│   └── CartMapper.java
│
├── validator/                       # Custom Validators
│   ├── UniqueEmailValidator.java
│   ├── StockValidator.java
│   └── PriceValidator.java
│
├── util/                            # Utility Classes
│   ├── FileUploadUtil.java          # Image Upload Handling
│   ├── SearchUtil.java              # Search Query Parsing
│   ├── CacheKeyUtil.java            # Cache Key Generation
│   └── DateUtil.java
│
└── SportsequipApplication.java      # Main Application Class
```

---

## 🗄️ 3. DATABASE SCHEMA (MySQL)

### Entity-Relationship Diagram

```
User (1) ────── (N) Order
  │
  ├─ (1) ─── (N) Cart
  ├─ (1) ─── (N) Review
  ├─ (1) ─── (N) Wishlist
  └─ (1) ─── (N) Role

Product (1) ───── (N) ProductImage
Product (1) ───── (N) Review
Product (N) ───── (M) Category
Product (1) ───── (N) CartItem
Product (1) ───── (N) OrderItem
Product (1) ───── (N) Wishlist

Cart (1) ────── (N) CartItem
CartItem (N) ─── (1) Product

Order (1) ────── (N) OrderItem
OrderItem (N) ─── (1) Product
```

### Table Definitions

```sql
-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    
    -- Address Fields
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_created_at (created_at)
);

CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE refresh_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token)
);

-- ============================================
-- PRODUCTS & CATEGORIES
-- ============================================

CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_slug (slug),
    INDEX idx_is_active (is_active)
);

CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    long_description TEXT,
    sku VARCHAR(100) NOT NULL UNIQUE,
    
    -- Pricing
    price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2),
    discount_price DECIMAL(10, 2),
    discount_percentage INT,
    
    -- Stock Management
    stock_quantity INT NOT NULL DEFAULT 0,
    low_stock_threshold INT DEFAULT 10,
    
    -- Ratings & Reviews
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    
    -- Category & Type
    category_id INT NOT NULL,
    product_type VARCHAR(50), -- e.g., SHOES, APPAREL, EQUIPMENT
    
    -- Variants Support
    has_size_variant BOOLEAN DEFAULT FALSE,
    has_color_variant BOOLEAN DEFAULT FALSE,
    available_sizes VARCHAR(500), -- JSON or CSV: XS,S,M,L,XL
    available_colors VARCHAR(500), -- JSON or CSV: RED,BLUE,BLACK
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    meta_keywords VARCHAR(500),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES categories(id),
    INDEX idx_name (name),
    INDEX idx_slug (slug),
    INDEX idx_sku (sku),
    INDEX idx_category_id (category_id),
    INDEX idx_is_active (is_active),
    INDEX idx_is_deleted (is_deleted),
    INDEX idx_price (price),
    INDEX idx_created_at (created_at),
    FULLTEXT INDEX idx_fulltext_search (name, description)
);

CREATE TABLE product_images (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    display_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_is_primary (is_primary)
);

-- ============================================
-- CART & CHECKOUT
-- ============================================

CREATE TABLE carts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    total_price DECIMAL(10, 2) DEFAULT 0.00,
    item_count INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

CREATE TABLE cart_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cart_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price_at_add DECIMAL(10, 2) NOT NULL,
    
    -- Variants
    selected_size VARCHAR(20),
    selected_color VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_cart_id (cart_id),
    INDEX idx_product_id (product_id),
    UNIQUE KEY unique_cart_product_variant (cart_id, product_id, selected_size, selected_color)
);

-- ============================================
-- ORDERS
-- ============================================

CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    
    -- Totals
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0.00,
    shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Shipping Address
    shipping_address_line_1 VARCHAR(255),
    shipping_address_line_2 VARCHAR(255),
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    shipping_country VARCHAR(100),
    
    -- Status
    status ENUM('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    payment_method VARCHAR(50), -- CREDIT_CARD, DEBIT_CARD, PAYPAL, etc.
    payment_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED
    
    -- Notes
    customer_notes TEXT,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_order_number (order_number),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_payment_status (payment_status)
);

CREATE TABLE order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL, -- Snapshot
    discount_applied DECIMAL(10, 2) DEFAULT 0.00,
    subtotal DECIMAL(10, 2) NOT NULL,
    
    -- Variants Ordered
    selected_size VARCHAR(20),
    selected_color VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
);

-- ============================================
-- REVIEWS & RATINGS
-- ============================================

CREATE TABLE reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    
    helpful_count INT DEFAULT 0,
    unhelpful_count INT DEFAULT 0,
    
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at),
    UNIQUE KEY unique_user_product_review (product_id, user_id)
);

-- ============================================
-- WISHLIST
-- ============================================

CREATE TABLE wishlists (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    UNIQUE KEY unique_user_product_wishlist (user_id, product_id)
);

-- ============================================
-- AUDIT LOG (Optional but Recommended)
-- ============================================

CREATE TABLE audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    entity_type VARCHAR(100),
    entity_id BIGINT,
    action VARCHAR(50), -- CREATE, UPDATE, DELETE
    changes JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_entity_type (entity_type),
    INDEX idx_created_at (created_at)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Search & Filtering Optimization
CREATE INDEX idx_products_price_range ON products(price);
CREATE INDEX idx_products_category_active ON products(category_id, is_active, is_deleted);
CREATE INDEX idx_products_rating ON products(average_rating DESC);

-- Cart Optimization
CREATE INDEX idx_cart_items_cart_updated ON cart_items(cart_id, updated_at);

-- Order Optimization
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC);

-- Review Optimization
CREATE INDEX idx_reviews_product_rating ON reviews(product_id, rating);
CREATE INDEX idx_reviews_verified ON reviews(is_verified_purchase, created_at DESC);
```

---

## 📡 4. API ENDPOINT DESIGN

### Authentication Endpoints

```
POST /api/auth/register
  Request: { email, username, password, firstName, lastName }
  Response: { userId, email, username, token, refreshToken }
  Status: 201 Created

POST /api/auth/login
  Request: { email, password }
  Response: { userId, email, username, token, refreshToken, roles }
  Status: 200 OK

POST /api/auth/refresh-token
  Request: { refreshToken }
  Response: { token, refreshToken }
  Status: 200 OK

POST /api/auth/logout
  Request: {}
  Response: { message: "Logged out successfully" }
  Status: 200 OK
```

### Product Endpoints

```
GET /api/products
  Params: page=0&size=10&sort=price,asc&search=shoes&category=1&priceMin=10&priceMax=200&minRating=3
  Response: { content: [...], totalElements, totalPages, currentPage, pageSize }
  Status: 200 OK

GET /api/products/{id}
  Response: { id, name, price, description, images, reviews, ratings, stock, variants }
  Status: 200 OK

GET /api/products/search
  Params: keyword=basketball&category=SHOES&sort=newest
  Response: { content: [...], totalElements }
  Status: 200 OK

POST /api/products (Admin Only)
  Request: { name, description, price, category, sku, stock, images, variants }
  Response: { id, name, createdAt }
  Status: 201 Created

PUT /api/products/{id} (Admin Only)
  Request: { name, description, price, stock, etc }
  Response: { id, updatedAt }
  Status: 200 OK

DELETE /api/products/{id} (Admin Only)
  Response: { message: "Deleted successfully" }
  Status: 204 No Content

GET /api/categories
  Response: { content: [...] }
  Status: 200 OK
```

### Cart Endpoints

```
GET /api/cart
  Response: { id, items: [...], totalPrice, itemCount }
  Status: 200 OK

POST /api/cart/add
  Request: { productId, quantity, selectedSize, selectedColor }
  Response: { cart: {...}, message: "Added to cart" }
  Status: 200 OK

PUT /api/cart/items/{itemId}
  Request: { quantity }
  Response: { cart: {...} }
  Status: 200 OK

DELETE /api/cart/items/{itemId}
  Response: { cart: {...} }
  Status: 200 OK

DELETE /api/cart/clear
  Response: { message: "Cart cleared" }
  Status: 204 No Content
```

### Order Endpoints

```
POST /api/orders
  Request: { cartItems, shippingAddress, paymentMethod }
  Response: { orderId, orderNumber, totalAmount, status, createdAt }
  Status: 201 Created

GET /api/orders
  Params: page=0&size=10&status=PENDING
  Response: { content: [...], totalElements, totalPages }
  Status: 200 OK

GET /api/orders/{id}
  Response: { id, orderNumber, items, totalAmount, status, timeline }
  Status: 200 OK

PUT /api/orders/{id}/status (Admin Only)
  Request: { status }
  Response: { id, status, updatedAt }
  Status: 200 OK

PUT /api/orders/{id}/cancel
  Response: { message: "Order cancelled" }
  Status: 200 OK
```

### Review & Rating Endpoints

```
POST /api/products/{productId}/reviews
  Request: { rating, title, comment }
  Response: { id, rating, comment, createdAt }
  Status: 201 Created

GET /api/products/{productId}/reviews
  Params: page=0&size=5&sort=newest
  Response: { content: [...], totalElements }
  Status: 200 OK

GET /api/products/{productId}/rating-stats
  Response: { averageRating, totalReviews, distributionByRating: {1:2, 2:1, 3:5, 4:20, 5:50} }
  Status: 200 OK

PUT /api/reviews/{id}
  Request: { rating, title, comment }
  Response: { id, updatedAt }
  Status: 200 OK

DELETE /api/reviews/{id}
  Response: { message: "Review deleted" }
  Status: 204 No Content
```

### Wishlist Endpoints

```
POST /api/wishlists
  Request: { productId }
  Response: { id, productId, createdAt }
  Status: 201 Created

GET /api/wishlists
  Params: page=0&size=10
  Response: { content: [...], totalElements }
  Status: 200 OK

DELETE /api/wishlists/{productId}
  Response: { message: "Removed from wishlist" }
  Status: 204 No Content

POST /api/wishlists/add-to-cart
  Request: { wishlistIds: [1,2,3] }
  Response: { cart: {...} }
  Status: 200 OK
```

### User Profile Endpoints

```
GET /api/users/profile
  Response: { id, email, firstName, lastName, address, phone, createdAt }
  Status: 200 OK

PUT /api/users/profile
  Request: { firstName, lastName, phone, address }
  Response: { id, updatedAt }
  Status: 200 OK

PUT /api/users/change-password
  Request: { currentPassword, newPassword }
  Response: { message: "Password changed" }
  Status: 200 OK
```

---

## 🎨 5. FRONTEND STRUCTURE (React)

### Directory Organization

```
src/
├── components/
│   ├── common/
│   │   ├── Header.jsx              # Navigation Bar
│   │   ├── Footer.jsx              # Footer
│   │   ├── Navbar.jsx              # Mobile Navigation
│   │   ├── Loader.jsx              # Loading Spinner
│   │   ├── ErrorBoundary.jsx       # Error Handler
│   │   └── Toast.jsx               # Notifications
│   │
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── product/
│   │   ├── ProductCard.jsx         # Reusable Product Card
│   │   ├── ProductGrid.jsx         # Product Listing Grid
│   │   ├── ProductGallery.jsx      # Image Gallery
│   │   ├── RatingStars.jsx         # Star Rating Display
│   │   ├── ReviewItem.jsx          # Single Review
│   │   └── ProductVariantSelector.jsx
│   │
│   ├── search/
│   │   ├── SearchBar.jsx           # Search Input
│   │   ├── FilterSidebar.jsx       # Filter Panel
│   │   ├── CategoryFilter.jsx      # Category Selection
│   │   ├── PriceRangeFilter.jsx    # Price Slider
│   │   └── SortDropdown.jsx        # Sort Options
│   │
│   ├── cart/
│   │   ├── CartItem.jsx            # Single Cart Item
│   │   ├── CartSummary.jsx         # Cart Total Section
│   │   └── EmptyCart.jsx           # Empty State
│   │
│   ├── order/
│   │   ├── OrderItem.jsx           # Single Order Item
│   │   ├── OrderTimeline.jsx       # Order Status Timeline
│   │   └── ShippingForm.jsx        # Shipping Address Form
│   │
│   ├── admin/
│   │   ├── AdminLayout.jsx
│   │   ├── ProductForm.jsx         # Product CRUD Form
│   │   ├── OrderManagement.jsx     # Admin Order View
│   │   ├── UserManagement.jsx      # User Management
│   │   └── Dashboard.jsx           # Admin Stats
│   │
│   └── shared/
│       ├── Pagination.jsx
│       ├── Modal.jsx
│       ├── Breadcrumb.jsx
│       └── Badge.jsx
│
├── pages/
│   ├── Home.jsx                    # Homepage
│   ├── ProductList.jsx             # Product Listing with Filters
│   ├── ProductDetail.jsx           # Single Product Detail
│   ├── Cart.jsx                    # Shopping Cart
│   ├── Checkout.jsx                # Order Checkout
│   ├── OrderConfirmation.jsx       # Post-Order
│   ├── OrderHistory.jsx            # User Orders
│   ├── Profile.jsx                 # User Profile
│   ├── Wishlist.jsx                # Wishlist Page
│   ├── Login.jsx                   # Login Page
│   ├── Register.jsx                # Registration Page
│   ├── AdminDashboard.jsx          # Admin Dashboard
│   ├── NotFound.jsx                # 404 Page
│   └── ServerError.jsx             # 500 Page
│
├── context/
│   ├── AuthContext.jsx             # Auth State Management
│   ├── CartContext.jsx             # Cart State Management
│   ├── ThemeContext.jsx            # Theme Toggle
│   └── NotificationContext.jsx     # Notifications
│
├── hooks/
│   ├── useAuth.js                  # Auth Hook
│   ├── useCart.js                  # Cart Hook
│   ├── useApi.js                   # API Call Hook
│   ├── useDebounce.js              # Debounce Hook
│   ├── usePagination.js            # Pagination Hook
│   ├── useLocalStorage.js          # LocalStorage Hook
│   └── useWindowSize.js            # Responsive Hook
│
├── services/
│   ├── api.js                      # Axios Instance
│   ├── authService.js              # Auth API Calls
│   ├── productService.js           # Product API Calls
│   ├── cartService.js              # Cart API Calls
│   ├── orderService.js             # Order API Calls
│   ├── reviewService.js            # Review API Calls
│   └── userService.js              # User API Calls
│
├── utils/
│   ├── formatters.js               # Format Functions
│   ├── validators.js               # Form Validation
│   ├── constants.js                # App Constants
│   ├── errorHandler.js             # Error Handling
│   └── storageUtil.js              # LocalStorage Utilities
│
├── styles/
│   ├── index.css                   # Global Styles
│   ├── variables.css               # CSS Variables
│   └── components.css              # Component Styles
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── App.jsx                         # Main App Component
├── main.jsx                        # Entry Point
└── config.js                       # App Configuration
```

---

## 🚀 6. IMPLEMENTATION ROADMAP

### Phase 1: Foundation 

- [x] Project Setup
  - Spring Boot initialization with Spring Boot 3.0+
  - React Vite setup
  - MySQL database creation
  - Git repository setup

- [x] Database Schema
  - Create all tables with proper relationships
  - Add indexes for search queries
  - Set up initial data

- [x] Core Security
  - Implement JWT authentication
  - Spring Security configuration
  - User registration & login
  - Refresh token mechanism

- [x] Basic API Structure
  - Auth endpoints (login/register/refresh)
  - Global exception handling
  - Request/response DTOs
  - Input validation

- [x] Frontend Bootstrap
  - Vite project configuration
  - Set up routing (React Router v6)
  - Create layout components
  - Set up API service

### Phase 2: Core Features

- [x] Product Management
  - Product CRUD operations
  - Category management
  - Product images handling
  - Stock management

- [x] Search & Filtering
  - Full-text search implementation
  - Price range filtering
  - Category filtering
  - Sorting (price, newest, popularity)
  - Pagination

- [x] Frontend Product Pages
  - Product listing with filters
  - Product detail page
  - Image gallery with zoom
  - Rating & reviews display

- [x] Shopping Cart
  - Add/remove/update items
  - Cart persistence (DB + localStorage)
  - Prevent duplicates
  - Cart summary calculation

- [x] Cart UI Components
  - Cart page
  - Cart item display
  - Quantity selector
  - Empty cart state

### Phase 3: Orders & Reviews 

- [x] Order System
  - Checkout flow
  - Order creation with item snapshots
  - Order status management
  - Order history

- [x] Reviews & Ratings
  - Create/update/delete reviews
  - Rating calculation
  - Prevent duplicate reviews
  - Display reviews on product page

- [x] Wishlist
  - Add/remove wishlist items
  - View wishlist page
  - Move wishlist items to cart

- [x] Frontend Checkout & Orders
  - Checkout page with form validation
  - Shipping address entry
  - Order confirmation page
  - Order history page

### Phase 4: Admin & Polish 

- [x] Admin Dashboard
  - Product management interface
  - Order management & status updates
  - User management
  - Sales analytics & stats

- [x] User Profile
  - View/edit profile information
  - Change password
  - View order history
  - Manage wishlist

- [x] Advanced Features
  - Redis caching setup
  - Image upload optimization
  - API rate limiting
  - Logging & monitoring

- [x] Frontend Polish
  - Responsive design 
  - Skeleton loading states
  - Error handling & user feedback
  - Loading animations
  - Dark mode toggle (optional)

### Phase 5: Testing & Deployment

- [x] Backend Testing
  - Unit tests for services
  - Integration tests for APIs
  - Repository tests

- [x] Frontend Testing
  - Component tests
  - Integration tests
  - E2E tests (optional)

- [x] DevOps
  - Dockerize backend
  - Dockerize frontend
  - Docker Compose setup
  - Environment variables configuration

- [x] Deployment
  - Deploy to cloud (AWS/Heroku/DigitalOcean)
  - Set up CI/CD pipeline
  - Database migrations

---

## 🔐 7. SECURITY BEST PRACTICES

### Authentication & Authorization

```java
// JWT Token Validation
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) {
        // Extract JWT from Authorization header
        // Validate token signature & expiration
        // Set authentication context
    }
}

// Spring Security Config
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        return http
            .csrf().disable()
            .authorizeRequests()
                .antMatchers("/api/auth/**").permitAll()
                .antMatchers("/api/products/**").permitAll()
                .antMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            .and()
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}
```

### Input Validation & Sanitization

```java
// DTO Validation
@Data
public class ProductRequest {
    @NotBlank(message = "Product name is required")
    @Length(min = 3, max = 255)
    private String name;
    
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;
    
    @NotNull
    @Min(0)
    private Integer stockQuantity;
}

// Custom Validator
@Component
public class UniqueEmailValidator implements ConstraintValidator<UniqueEmail, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return userRepository.findByEmail(value).isEmpty();
    }
}
```

### Data Protection

- Password hashing with BCrypt (cost factor: 10)
- No sensitive data in logs
- HTTPS enforcement in production
- CORS configuration
- SQL injection prevention via JPA

---

## 📊 8. CACHING STRATEGY (Redis)

```java
@Configuration
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager(LettuceConnectionFactory connectionFactory) {
        return RedisCacheManager.create(connectionFactory);
    }
}

// Service Usage
@Service
public class ProductService {
    
    @Cacheable(value = "products", key = "#id")
    public ProductResponse getProductById(Long id) {
        // Fetches from DB only if not in cache
    }
    
    @CachePut(value = "products", key = "#result.id")
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        // Updates cache after DB update
    }
    
    @CacheEvict(value = "products", key = "#id")
    public void deleteProduct(Long id) {
        // Removes from cache
    }
}

// Cache Configuration
Cache Keys:
- products::{productId}                    → Product Details (TTL: 1 hour)
- product_list::{categoryId}:{page}        → Product Listings (TTL: 30 min)
- search_results::{keyword}:{filters}      → Search Results (TTL: 15 min)
- reviews::{productId}:{page}              → Product Reviews (TTL: 30 min)
- user::{userId}                           → User Profile (TTL: 1 hour)
- popular_products                         → Popular Products List (TTL: 1 hour)
```

---

## 📈 9. PERFORMANCE OPTIMIZATION

### Database Optimization

```java
// N+1 Query Prevention
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("SELECT p FROM Product p " +
           "LEFT JOIN FETCH p.images " +
           "LEFT JOIN FETCH p.reviews " +
           "WHERE p.id = :id")
    Optional<Product> findByIdWithDetails(@Param("id") Long id);
    
    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN FETCH p.images " +
           "WHERE p.isActive = true AND p.isDeleted = false")
    Page<Product> findAllActiveProducts(Pageable pageable);
}

// Index Strategy
CREATE INDEX idx_products_category_price ON products(category_id, price);
CREATE INDEX idx_products_rating_created ON products(average_rating DESC, created_at DESC);
CREATE FULLTEXT INDEX idx_products_search ON products(name, description);
```

### API Optimization

```java
// Pagination Best Practice
@GetMapping
public ResponseEntity<?> getProducts(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    @RequestParam(defaultValue = "created_at,desc") String sort) {
    
    Pageable pageable = PageRequest.of(page, size, 
        Sort.by(Sort.Direction.DESC, "createdAt"));
    
    return ResponseEntity.ok(productService.getProducts(pageable));
}

// Response DTO Trimming
@Data
public class ProductListResponse {
    private Long id;
    private String name;
    private BigDecimal price;
    private String imageUrl;
    private Double avgRating;
    // Don't include long_description, multiple images, all reviews here
}
```

### Frontend Optimization

```javascript
// Debounced Search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
};

// Lazy Loading Images
<img 
  src={imagePath} 
  loading="lazy" 
  alt="product"
/>

// Code Splitting
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Checkout = lazy(() => import('./pages/Checkout'));
```

---

## 📚 10. KEY IMPLEMENTATION DETAILS

### Exception Handling Example

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse("RESOURCE_NOT_FOUND", ex.getMessage(), 404));
    }
    
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<?> handleDuplicate(DuplicateResourceException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(new ErrorResponse("DUPLICATE_RESOURCE", ex.getMessage(), 409));
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ValidationErrorResponse("VALIDATION_FAILED", errors, 400));
    }
}
```

### Service Layer Transaction Management

```java
@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    
    @Transactional
    public OrderResponse createOrder(Long userId, OrderRequest request) {
        // Fetch cart
        Cart cart = cartRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
        
        // Validate stock
        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new ValidationException("Insufficient stock for " + product.getName());
            }
        }
        
        // Create order (with single transaction)
        Order order = new Order();
        order.setUser(user);
        order.setTotalAmount(cart.getTotalPrice());
        // ... set other fields
        
        // Reduce stock
        cart.getItems().forEach(item -> {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);
        });
        
        // Clear cart
        cartRepository.delete(cart);
        
        // Save order
        Order savedOrder = orderRepository.save(order);
        
        return orderMapper.toResponse(savedOrder);
        // All changes committed together or rolled back on error
    }
}
```

---

## 📋 11. DEVELOPMENT CHECKLIST

### Backend Implementation Checklist

- [ ] Project setup with Spring Boot 3.0+
- [ ] Database schema creation & migrations
- [ ] Entity classes with proper annotations
- [ ] JPA repositories with custom queries
- [ ] DTOs for all endpoints
- [ ] Service layer with business logic
- [ ] Controller endpoints with validation
- [ ] JWT authentication implementation
- [ ] Spring Security configuration
- [ ] Global exception handling
- [ ] Input validation with annotations
- [ ] Logging configuration (SLF4J)
- [ ] Entity mappers (MapStruct or manual)
- [ ] Pagination implementation
- [ ] Search functionality
- [ ] Image upload handling
- [ ] Redis caching (optional but recommended)
- [ ] API rate limiting
- [ ] Unit tests for services
- [ ] Integration tests for endpoints
- [ ] Database optimization & indexing
- [ ] Docker configuration
- [ ] Environment variables setup
- [ ] Documentation (Swagger/OpenAPI)

### Frontend Implementation Checklist

- [ ] React + Vite project setup
- [ ] React Router v6 configuration
- [ ] Context API / Redux Toolkit setup
- [ ] Axios API service
- [ ] Authentication pages (Login/Register)
- [ ] Protected routes
- [ ] Home page with featured products
- [ ] Product listing page with filters
- [ ] Product detail page
- [ ] Search functionality with debounce
- [ ] Filter sidebar component
- [ ] Pagination component
- [ ] Shopping cart functionality
- [ ] Cart page UI
- [ ] Checkout page with form
- [ ] Order confirmation page
- [ ] Order history page
- [ ] User profile page
- [ ] Wishlist functionality
- [ ] Review & rating display
- [ ] Admin dashboard
- [ ] Product management (CRUD)
- [ ] Order management
- [ ] Responsive design 
- [ ] Loading skeleton states
- [ ] Error handling & user feedback
- [ ] Image lazy loading
- [ ] Dark mode 
- [ ] Component tests
- [ ] Docker configuration

---

## 🎯 CONCLUSION

This architecture provides:

✅ **Scalability**: Clean separation of concerns allows easy horizontal scaling
✅ **Maintainability**: SOLID principles and design patterns ensure clean code
✅ **Performance**: Caching, indexing, and optimized queries
✅ **Security**: JWT, encryption, input validation, role-based access
✅ **User Experience**: Modern UI, responsive design, smooth interactions
✅ **Production-Ready**: Error handling, logging, monitoring, Docker support

The monolithic approach is ideal for this scope while maintaining architectural patterns that allow future migration to microservices if needed.

---

**Next Steps**: Follow the implementation roadmap, test thoroughly, and deploy with confidence!
