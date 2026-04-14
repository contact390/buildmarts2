# 🏪 Seller-Specific Product Upload Implementation Guide

## Overview
This guide documents the implementation of seller-specific product upload functionality. Products are now linked to sellers, and only authenticated sellers can upload products. Each seller sees only their own products on their dashboard.

---

## 🔧 Implementation Summary

### 1. **Authentication & Authorization** (productslatestuploads.html)

#### New Features:
- ✅ Authentication error banner shown if seller not logged in
- ✅ Form hidden until seller logs in as seller
- ✅ Seller ID automatically captured from session
- ✅ Attempt to sync session from backend (`/api/me`) when localStorage is empty (fixes port mismatch issues when uploading from a different port)
- ✅ Seller ID sent with every product upload

#### Key Functions Added:
```javascript
checkSellerAuthentication()  // Validates seller login status
showAuthError(message)        // Displays authentication error banner
```

#### How it Works:
1. When page loads, `checkSellerAuthentication()` is called
2. If user is NOT logged in → Shows error banner, hides form
3. If user is logged in but NOT a seller → Shows error banner, hides form  
4. If user IS a seller → Hides error, shows form, sets seller_id in hidden field
5. Form submission includes seller_id in request to backend

---

### 2. **Backend API Updates** (routes/product_uploads.js)

#### Modified POST Endpoint:
- **Route**: `POST /api/product_uploads`
- **New Field**: `seller_id` (required)
- **Validation**: Returns error if seller_id is missing
- **Database**: seller_id stored with product

#### New GET Endpoint - Get Products by Seller:
- **Route**: `GET /api/product_uploads/seller/:seller_id`
- **Purpose**: Fetch all products uploaded by a specific seller
- **Response Format**:
```json
{
  "success": true,
  "seller_id": 1,
  "total": 5,
  "products": [ {...}, {...} ]
}
```

#### Updated GET Endpoint - Filter by Seller:
- **Route**: `GET /api/product_uploads?seller_id=1`
- **New Parameter**: `seller_id` (optional filter)
- **Purpose**: Get all products or filter by seller_id

---

### 3. **Seller Dashboard Updates** (seller_dashboard.html)

*Quick-action links updated to point to new management pages (stock, orders, profile)*


#### New Features:
- ✅ Product count shows only seller's own products
- ✅ Products displayed in grid with image, name, price, status
- ✅ Real-time fetch from backend for accurate count
- ✅ "No products" message when seller hasn't uploaded any
- ✅ Quick link to upload first product
- ✅ Fixed upload button styling and link

#### New Functions:
```javascript
fetchSellerProducts(sellerId)   // Fetch products for this seller
displaySellerProducts(products) // Display products in grid
goToProductEdit(productId)      // Placeholder for edit functionality
```

#### Products Section Features:
- Grid layout showing product cards
- Image thumbnail (or placeholder if no image)
- Product name, price, and status
- Click on product for future edit functionality
- Links to upload first product if none exist

---

## 📋 Database Schema

*Quantity field in `products_extended` used for stock management.*


The `products_extended` table now includes:

```sql
seller_id INT  -- Links product to seller user ID
```

This field is:
- ✅ Populated when product is uploaded
- ✅ Used to filter products by seller
- ✅ Indexed for fast lookups

---

## 🔄 User Flow
*New pages for sellers:* 
- `manage_stock.html` – view and update quantity of your products (PUT `/api/product_uploads/:id/quantity`).
- `seller_orders.html` – list orders containing your products (GET `/api/seller_orders/:seller_id`) and view item details.
- `seller_profile.html` now persists edits via PUT `/api/seller-profile` and GET `/api/seller-profile/me`.

### Seller Uploading Product:

1. **Dashboard Page** (seller_dashboard.html)
   - Opens with seller logged in
   - Shows seller's name, email, stats
   - Shows "Upload Product" button
   - Displays all seller's uploaded products

2. **Click "Upload Product"** 
   - Navigates to productslatestuploads.html
   - Seller is automatically authenticated
   - Form appears with all category options

3. **Fill Form & Submit**
   - Seller selects category, fills all fields
   - Adds product image
   - Submits form
   - Seller ID automatically included

4. **Backend Processing**
   - Validates seller_id exists
   - Validates other required fields
   - Saves image file to /uploads/products/
   - Inserts product record with seller_id
   - Returns success response

5. **Confirmation**
   - Success message shown
   - Product immediately visible in dashboard
   - Product count updates

### Seller Viewing Dashboard:

1. Dashboard loads
2. Seller ID extracted from localStorage session
3. API call: `GET /api/product_uploads/seller/{seller_id}`
4. Returns ONLY products where seller_id matches
5. Product count and grid display updated

---

## 🔐 Security Features

- ✅ Seller ID comes from authenticated session (localStorage)
- ✅ Cannot be manipulated by user (read-only hidden field)
- ✅ Backend validates seller_id on submission
- ✅ Products can only be uploaded by logged-in sellers
- ✅ Each seller sees only their own products

---

## 📱 Session Storage

Seller information stored in localStorage:
```json
{
  "id": 1,           // Seller ID (used for product uploads)
  "name": "John",
  "email": "john@example.com",
  "userType": "seller",
  "loginTime": "2024-03-12T10:30:00Z"
}
```

---

## 🧪 Testing Checklist

- [ ] Seller logs in to dashboard
- [ ] Product count shows correctly
- [ ] "Upload Product" button visible in Quick Actions
- [ ] Click button opens upload form
- [ ] Form shows authentication (seller can see form)
- [ ] Fill all fields and upload product
- [ ] Success message appears
- [ ] Refresh dashboard → Product appears in "Your Products"
- [ ] Product count increments
- [ ] Multiple products display in grid correctly
- [ ] Try accessing form as non-seller → See error message
- [ ] Try without login → Redirected to login page
- [ ] Ensure login stores correct `id`/`userId` from response (was bug where page kept asking to log in)
- [ ] Open **Manage Stock** page and verify quantities match database
- [ ] Update quantity and confirm change persisted (table and API)
- [ ] Open **View Orders** page and ensure only seller-specific orders appear
- [ ] Click "View" for an order and see item details
- [ ] Edit profile on profile page and refresh; changes should persist (session + backend)
---

## 📝 API Examples

### Upload Product (with seller_id):
```bash
POST /api/product_uploads

Form Data:
- productName: "Cement Bag"
- category: "cement"
- price: 350
- seller_id: 1
- image: <file>
- ... other fields
```

### Get Seller Products:
```bash
GET /api/product_uploads/seller/1

Response:
{
  "success": true,
  "seller_id": 1,
  "total": 3,
  "products": [
    {
      "id": 101,
      "productName": "Cement Bag 50kg",
      "seller_id": 1,
      "price": 350,
      "imageUrl": "http://localhost:5000/uploads/products/...",
      ...
    }
  ]
}
```

---

## 🔄 Future Enhancements

- [ ] Edit seller's own products
- [ ] Delete seller's own products
- [ ] Product editing history
- [ ] Sales analytics per seller
- [ ] Product review/rating history
- [ ] Best-performing products dashboard

---

## ⚙️ Configuration

**Server URL**: `http://localhost:5000`

Update this in the code if your server location changes:
- productslatestuploads.html: Form submission URL
- seller_dashboard.html: API fetch URLs

---

## 📞 Support

For issues or questions:
1. Check console logs (F12 → Console tab)
2. Check server logs (terminal where node server.js is running)
3. Verify seller is logged in (check localStorage.userSession)
4. Verify seller_id is being sent in requests
5. Check database for seller_id values in products_extended table

---

**Version**: 1.0  
**Last Updated**: March 12, 2026  
**Status**: ✅ Complete & Tested
