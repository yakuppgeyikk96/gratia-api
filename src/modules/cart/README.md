# 🛒 Cart Module Documentation

## 📋 Table of Contents

- [Overview](#overview)
- [Data Models](#data-models)
- [API Endpoints](#api-endpoints)
- [Business Rules](#business-rules)
- [Error Handling](#error-handling)
- [Module Structure](#module-structure)
- [Testing Examples](#testing-examples)

---

## Overview

This module handles shopping cart management for the e-commerce application. Users can add, update, remove products, and view their cart.

### Features

- ✅ One cart per user
- ✅ Product variant support
- ✅ Automatic price and total calculation
- ✅ Stock validation
- ✅ Quantity limits
- ✅ Discounted price support

---

## Data Models

### Cart Model

```typescript
interface CartDoc {
  _id: ObjectId;
  userId: ObjectId; // User reference
  items: CartItem[]; // Cart items array
  totalItems: number; // Auto-calculated total item count
  totalPrice: number; // Auto-calculated total price
  createdAt: Date; // Auto-generated
  updatedAt: Date; // Auto-generated
}
```

### Cart Item Model

```typescript
interface CartItem {
  productId: ObjectId; // Product reference
  sku: string; // Product or variant SKU
  quantity: number; // Item quantity (1-100)
  price: number; // Original price
  discountedPrice?: number; // Discounted price (if applicable)
  productName: string; // Product name (snapshot)
  productImages: string[]; // Product images (snapshot)
  attributes: {
    // Product attributes (standardized)
    color?: string;
    size?: string;
    material?: string;
  };
  isVariant: boolean; // Is this a variant or base product
}
```

### Product Attributes

```typescript
interface ProductAttributes {
  color?: string;
  size?: string;
  material?: string;
}
```

---

## API Endpoints

**Base Path:** `/api/cart`
**Authentication:** Required (Bearer Token)

### 1. Get Cart

Retrieves the user's cart

```http
GET /api/cart
Authorization: Bearer {token}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Cart retrieved successfully",
  "data": {
    "_id": "652abc123...",
    "userId": "651xyz789...",
    "items": [
      {
        "productId": "650prod123...",
        "sku": "PROD-001-RED-M",
        "quantity": 2,
        "price": 99.99,
        "discountedPrice": 79.99,
        "productName": "Premium T-Shirt",
        "productImages": [
          "https://example.com/image1.jpg",
          "https://example.com/image2.jpg"
        ],
        "attributes": {
          "color": "Red",
          "size": "M"
        },
        "isVariant": true
      }
    ],
    "totalItems": 2,
    "totalPrice": 159.98,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T14:45:00.000Z"
  }
}
```

---

### 2. Add Item to Cart

Adds an item to the cart

```http
POST /api/cart
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "productId": "650prod123...",
  "sku": "PROD-001-RED-M",
  "quantity": 2
}
```

**Validation Rules:**

- `productId`: Required, non-empty string
- `sku`: Required, non-empty string
- `quantity`: Required, integer, min: 1, max: 100

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "data": {
    "_id": "652abc123...",
    "userId": "651xyz789...",
    "items": [...],
    "totalItems": 2,
    "totalPrice": 159.98,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T14:45:00.000Z"
  }
}
```

**Business Logic:**

- If item already exists in cart, quantity is automatically incremented
- Stock availability is checked before adding
- Product must be active
- Maximum 50 different items can be added

---

### 3. Update Cart Item

Updates item quantity in cart

```http
PUT /api/cart
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "sku": "PROD-001-RED-M",
  "quantity": 5
}
```

**Validation Rules:**

- `sku`: Required, non-empty string
- `quantity`: Required, integer, min: 1, max: 100

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Cart item updated successfully",
  "data": {
    "_id": "652abc123...",
    "userId": "651xyz789...",
    "items": [...],
    "totalItems": 5,
    "totalPrice": 399.95,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T15:00:00.000Z"
  }
}
```

---

### 4. Remove Item from Cart

Removes an item from cart

```http
DELETE /api/cart/:sku
Authorization: Bearer {token}
```

**URL Parameters:**

- `sku`: Product SKU to remove

**Example:**

```http
DELETE /api/cart/PROD-001-RED-M
Authorization: Bearer {token}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Item removed from cart successfully",
  "data": {
    "_id": "652abc123...",
    "userId": "651xyz789...",
    "items": [],
    "totalItems": 0,
    "totalPrice": 0,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T15:30:00.000Z"
  }
}
```

---

### 5. Clear Cart

Clears the entire cart

```http
DELETE /api/cart
Authorization: Bearer {token}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Cart cleared successfully",
  "data": {
    "_id": "652abc123...",
    "userId": "651xyz789...",
    "items": [],
    "totalItems": 0,
    "totalPrice": 0,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T16:00:00.000Z"
  }
}
```

---

## Business Rules

### Limits

```typescript
CART_LIMITS = {
  MAX_ITEMS: 50, // Maximum 50 different items
  MAX_QUANTITY_PER_ITEM: 100, // Maximum 100 units per item
};
```

### Validations

#### 1. Product Validation

- ✅ Product must exist
- ✅ Product must be active
- ✅ Valid SKU required

#### 2. Stock Validation

- ✅ Product stock check: `product.stock >= quantity`

#### 3. Quantity Validation

- ✅ Minimum: 1
- ✅ Maximum: 100
- ✅ Must be integer

#### 4. Cart Limits

- ✅ Maximum 50 different items
- ✅ Maximum 100 units per item

### Price Calculation

**Price per item:**

```typescript
const itemPrice = item.discountedPrice ?? item.price;
```

**Total price:**

```typescript
totalPrice = items.reduce((sum, item) => {
  const itemPrice = item.discountedPrice ?? item.price;
  return sum + itemPrice * item.quantity;
}, 0);
```

**Total items:**

```typescript
totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
```

### Important Notes

#### Nullish Coalescing (`??`)

The code uses nullish coalescing to properly handle `0` prices (e.g., free items, full discount):

```typescript
// ✅ CORRECT
const itemPrice = item.discountedPrice ?? item.price;

// ❌ WRONG
const itemPrice = item.discountedPrice || item.price; // 0 price would fallback to base price!
```

**Why this matters:**

- Using `||` treats `0` as falsy and incorrectly falls back to the regular price
- Using `??` only falls back when the value is `null` or `undefined`
- This ensures free items (price: 0) are handled correctly

---

## Error Handling

### Error Codes

| HTTP Status | Error Code              | Message                                | Description             |
| ----------- | ----------------------- | -------------------------------------- | ----------------------- |
| 404         | `NOT_FOUND`             | Cart not found                         | Cart does not exist     |
| 404         | `NOT_FOUND`             | Item not found in cart                 | Item not in cart        |
| 404         | `NOT_FOUND`             | Product not found                      | Product does not exist  |
| 400         | `BAD_REQUEST`           | Product is not active                  | Product is inactive     |
| 400         | `BAD_REQUEST`           | Insufficient stock available           | Not enough stock        |
| 400         | `BAD_REQUEST`           | Invalid SKU for this product           | Invalid SKU             |
| 400         | `BAD_REQUEST`           | Maximum quantity per item exceeded     | Quantity limit exceeded |
| 400         | `BAD_REQUEST`           | Cart cannot contain more than 50 items | Cart limit reached      |
| 500         | `INTERNAL_SERVER_ERROR` | Failed to update cart                  | Update operation failed |

### Error Response Format

```json
{
  "success": false,
  "message": "Insufficient stock available",
  "error": {
    "code": "BAD_REQUEST",
    "statusCode": 400
  }
}
```

---

## Example Use Cases

### Scenario 1: Add Product to Cart

```typescript
// 1. Add base product
POST /api/cart
{
  "productId": "650prod123",
  "sku": "PROD-001",
  "quantity": 1
}

// 2. Add same product again (quantity increases)
POST /api/cart
{
  "productId": "650prod123",
  "sku": "PROD-001",
  "quantity": 2
}
// Result: quantity = 3

// 3. Add different variant
POST /api/cart
{
  "productId": "650prod123",
  "sku": "PROD-001-BLUE-L",
  "quantity": 1,
  "attributes": {
    "color": "Blue",
    "size": "L"
  }
}
```

### Scenario 2: Update Quantity

```typescript
// Update quantity
PUT /api/cart
{
  "sku": "PROD-001",
  "quantity": 5
}
```

### Scenario 3: Cart Management

```typescript
// 1. View cart
GET / api / cart;

// 2. Remove specific item
DELETE / api / cart / PROD - 001 - BLUE - L;

// 3. Clear entire cart
DELETE / api / cart;
```

---

## Technical Details

### Middleware Stack

```typescript
router.use(authMiddleware);        // JWT authentication
router.use(validateBody(...));     // Zod validation
router.use(asyncHandler(...));     // Error handling
```

### Database Indexes

```typescript
userId: 1; // Unique index
updatedAt: -1; // Sort index
```

### Pre-save Hook

Automatic calculations before saving cart:

```typescript
cart.totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
cart.totalPrice = items.reduce((sum, item) => {
  const itemPrice = item.discountedPrice ?? item.price;
  return sum + itemPrice * item.quantity;
}, 0);
```

---

## Module Structure

```
cart/
├── constants/
│   └── cart.constants.ts       # Messages, limits
├── controllers/
│   └── cart.controller.ts      # HTTP handlers
├── helpers/
│   └── cart.helpers.ts         # Business logic helpers
├── repositories/
│   └── cart.repository.ts      # Database operations
├── routes/
│   └── cart.routes.ts          # Route definitions
├── services/
│   └── cart.services.ts        # Business logic
├── types/
│   ├── AddToCartDto.ts         # Request DTOs
│   ├── UpdateCartItemDto.ts
│   └── CartResponseDto.ts      # Response DTOs
└── validations/
    └── cart.validations.ts     # Zod schemas
```

---

## Testing Examples

### Postman Collection

```json
{
  "info": {
    "name": "Cart API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Cart",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": "{{baseUrl}}/api/cart"
      }
    },
    {
      "name": "Add to Cart",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"productId\": \"650prod123\",\n  \"sku\": \"PROD-001-RED-M\",\n  \"quantity\": 2,\n  \"attributes\": {\n    \"color\": \"Red\",\n    \"size\": \"M\"\n  }\n}"
        },
        "url": "{{baseUrl}}/api/cart"
      }
    },
    {
      "name": "Update Cart Item",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"sku\": \"PROD-001-RED-M\",\n  \"quantity\": 5\n}"
        },
        "url": "{{baseUrl}}/api/cart"
      }
    },
    {
      "name": "Remove from Cart",
      "request": {
        "method": "DELETE",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": "{{baseUrl}}/api/cart/PROD-001-RED-M"
      }
    },
    {
      "name": "Clear Cart",
      "request": {
        "method": "DELETE",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": "{{baseUrl}}/api/cart"
      }
    }
  ]
}
```

### cURL Examples

**Get Cart:**

```bash
curl -X GET "http://localhost:3000/api/cart" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Add to Cart:**

```bash
curl -X POST "http://localhost:3000/api/cart" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "650prod123",
    "sku": "PROD-001-RED-M",
    "quantity": 2,
    "attributes": {
      "color": "Red",
      "size": "M"
    }
  }'
```

**Update Cart Item:**

```bash
curl -X PUT "http://localhost:3000/api/cart" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "PROD-001-RED-M",
    "quantity": 5
  }'
```

**Remove from Cart:**

```bash
curl -X DELETE "http://localhost:3000/api/cart/PROD-001-RED-M" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Clear Cart:**

```bash
curl -X DELETE "http://localhost:3000/api/cart" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Best Practices

1. **Authentication**: JWT token required for all requests
2. **Idempotency**: Re-adding same SKU increases quantity automatically
3. **Stock Checking**: Stock is validated on every operation
4. **Price Snapshot**: Product prices are saved at add time (not dynamically fetched)
5. **Error Handling**: All errors follow standard format
6. **Validation**: Input validation using Zod schemas
7. **Transaction Safety**: Cart updates are atomic
8. **Index Usage**: Proper database indexes for performance

---

## Future Improvements

- [ ] Cart expiration (auto-cleanup old carts)
- [ ] Cart merging (merge guest cart with authenticated user cart)
- [ ] Cart sharing (share cart via link)
- [ ] Save for later functionality
- [ ] Price change notifications
- [ ] Out of stock notifications
- [ ] Coupon/discount code support
- [ ] Cart abandonment tracking

---

**Prepared by:** Cart Module Development Team
**Last Updated:** November 2024
**Version:** 1.0.0
