# Buyer Profile Sessions Documentation

## Overview
The buyer profile (`user_profile.html`) uses **localStorage** to manage user sessions and data persistence. Below is a complete technical explanation of all sessions used.

---

## 1. **userSession** - Primary User Session

### Purpose
Stores authenticated user profile information after login.

### Storage Key
```
localStorage.getItem('userSession')
```

### Data Structure
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "userType": "buyer",
  "loginTime": "2026-01-15T10:30:00Z",
  "phone": "+91-9876543210",
  "address": "123 Main St",
  "city": "Mumbai",
  "postal": "400001"
}
```

### Data Fields Explained

| Field | Type | Purpose | Example |
|-------|------|---------|---------|
| `name` | String | User's full name | "John Doe" |
| `email` | String | User's email address | "john@example.com" |
| `userType` | String | Account type: "buyer" or "seller" | "buyer" |
| `loginTime` | ISO String | Timestamp when user logged in | "2026-01-15T10:30:00Z" |
| `phone` | String | User's phone number (optional) | "+91-9876543210" |
| `address` | String | Delivery/residential address (optional) | "123 Main St" |
| `city` | String | City name (optional) | "Mumbai" |
| `postal` | String | Postal/ZIP code (optional) | "400001" |

### When Created
- **Created on**: User login (login.html)
- **Created by**: Authentication module
- **Scope**: Persists across all pages until logout

### When Updated
- **User Settings Tab**: When user clicks "Save Changes" in profile settings
- **Function**: `saveProfile()` - Updates name, email, phone, address, city, postal
- **Example Update Code**:
```javascript
const userSession = JSON.parse(localStorage.getItem('userSession'));
userSession.name = "Updated Name";
userSession.email = "newemail@example.com";
localStorage.setItem('userSession', JSON.stringify(userSession));
```

### Used By Functions
1. **loadUserProfile()** - Reads userSession on page load
2. **saveProfile()** - Updates userSession when editing profile
3. **goToDashboard()** - Reads userType to redirect to correct dashboard
4. **logoutAllDevices()** - Clears userSession on logout
5. **deleteAccount()** - Removes userSession on account deletion

### Access Pattern
```javascript
// Read
const userSession = JSON.parse(localStorage.getItem('userSession'));
const userName = userSession.name;
const userEmail = userSession.email;
const userType = userSession.userType; // "buyer" or "seller"

// Update
userSession.name = "New Name";
localStorage.setItem('userSession', JSON.stringify(userSession));
```

---

## 2. **userOrders** - Order History Session

### Purpose
Stores all orders placed by the buyer for order history display.

### Storage Key
```
localStorage.getItem('userOrders')
```

### Data Structure
```json
[
  {
    "orderId": "ORD-20260115-001",
    "createdAt": "2026-01-15T10:30:00Z",
    "status": "delivered",
    "totalAmount": 5499.50,
    "items": [
      {
        "productId": 101,
        "productName": "Cement Bag 50kg",
        "quantity": 2,
        "price": 450.00,
        "subtotal": 900.00
      },
      {
        "productId": 102,
        "productName": "Bricks (per 1000)",
        "quantity": 1,
        "price": 4599.50,
        "subtotal": 4599.50
      }
    ]
  },
  {
    "orderId": "ORD-20260114-001",
    "createdAt": "2026-01-14T15:45:00Z",
    "status": "pending",
    "totalAmount": 2500.00,
    "items": [
      {
        "productId": 103,
        "productName": "Iron Rod 12mm",
        "quantity": 5,
        "price": 500.00,
        "subtotal": 2500.00
      }
    ]
  }
]
```

### Order Fields Explained

| Field | Type | Purpose | Example |
|-------|------|---------|---------|
| `orderId` | String | Unique order identifier | "ORD-20260115-001" |
| `createdAt` | ISO String | Timestamp when order was placed | "2026-01-15T10:30:00Z" |
| `status` | String | Order status: "pending", "delivered", "cancelled", "processing" | "delivered" |
| `totalAmount` | Number | Total order amount (with tax & delivery) | 5499.50 |
| `items` | Array | Array of ordered products | [...] |

### Item Fields (within items array)

| Field | Type | Purpose | Example |
|-------|------|---------|---------|
| `productId` | Number | Product ID from product database | 101 |
| `productName` | String | Product name for display | "Cement Bag 50kg" |
| `quantity` | Number | Quantity ordered | 2 |
| `price` | Number | Unit price at time of order | 450.00 |
| `subtotal` | Number | quantity × price | 900.00 |

### When Created
- **Created on**: Order placement (checkout.html)
- **Created by**: Checkout module
- **Appended to**: Existing userOrders array
- **Example Creation Code**:
```javascript
const newOrder = {
  orderId: "ORD-" + Date.now(),
  createdAt: new Date().toISOString(),
  status: "pending",
  totalAmount: cartTotal,
  items: cartItems
};

const userOrders = JSON.parse(localStorage.getItem('userOrders')) || [];
userOrders.push(newOrder);
localStorage.setItem('userOrders', JSON.stringify(userOrders));
```

### When Updated
- **Status Update**: When order is processed/delivered (admin/backend updates)
- **Display**: Read-only on profile page (no direct update from profile page)

### Used By Functions
1. **loadUserOrders()** - Reads and displays orders in "Orders" tab
2. **viewOrderDetails()** - Reads specific order and redirects to order-details.html
3. **logoutAllDevices()** - Clears userOrders on logout
4. **deleteAccount()** - Deletes userOrders on account deletion

### Access Pattern
```javascript
// Read all orders
const userOrders = JSON.parse(localStorage.getItem('userOrders')) || [];

// Get orders in reverse (newest first)
const recentOrders = userOrders.reverse();

// Find specific order
const order = userOrders.find(o => o.orderId === 'ORD-20260115-001');

// Get total spent
const totalSpent = userOrders.reduce((sum, order) => sum + order.totalAmount, 0);
```

---

## 3. **isLoggedIn** - Login Status Flag

### Purpose
Simple boolean flag to indicate if user is currently authenticated.

### Storage Key
```
localStorage.getItem('isLoggedIn')
```

### Data Value
```
"true" (string, not boolean)
```

### When Created
- **Created on**: Successful login
- **Value**: "true"

### When Removed
- **On logout**: `logoutAllDevices()` removes this flag
- **On account deletion**: `deleteAccount()` removes this flag
- **Session expiry**: Manual removal required

### Used By
- Navigation/routing modules to check authentication status
- Login page redirect check

### Access Pattern
```javascript
// Check login status
if (localStorage.getItem('isLoggedIn') === 'true') {
  // User is logged in
} else {
  // Redirect to login
}
```

---

## 4. **cartLocalCount** - Cart Item Count (Related Session)

### Purpose
Stores the count of items in shopping cart for navbar badge display.

### Storage Key
```
localStorage.getItem('cartLocalCount')
```

### Data Value
```
"0" (string representing number)
```

### Used In
- cart.html
- navbar display

---

## Session Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    USER LIFECYCLE                        │
└─────────────────────────────────────────────────────────┘

[User Login Page]
       ↓
[Create: isLoggedIn = "true"]
[Create: userSession = {...}]
       ↓
[User Browses/Shops]
[Read: userSession for profile display]
[Read: userOrders for order history]
       ↓
[User Places Order]
[Append: new order to userOrders]
       ↓
[User Edits Profile]
[Update: userSession with new values]
       ↓
[User Logs Out]
[Delete: isLoggedIn, userSession, userOrders, cartLocalCount]
```

---

## Security Considerations

### ⚠️ Important Notes for Technical Team

1. **No Payment Data Stored**: Payment information is NOT stored in localStorage
2. **No Password Stored**: Passwords should NEVER be in localStorage
3. **Client-Side Only**: These sessions are client-side only; server should maintain authoritative user data
4. **XSS Vulnerability**: LocalStorage is susceptible to XSS attacks - implement CSP (Content Security Policy)
5. **Data Validation**: Always validate userSession data before using it
6. **Session Sync**: Multiple tabs may have out-of-sync data; consider using storage events:

```javascript
// Sync between tabs
window.addEventListener('storage', function(e) {
  if (e.key === 'userSession') {
    // Reload profile if userSession changes in another tab
    loadUserProfile();
  }
});
```

---

## Complete Session Management Functions

### 1. Load Profile
```javascript
function loadUserProfile() {
  const userSessionJSON = localStorage.getItem('userSession');
  if (!userSessionJSON) {
    alert('Please login first!');
    window.location.href = 'login.html';
    return;
  }
  
  const userSession = JSON.parse(userSessionJSON);
  // Use userSession data to populate UI
}
```

### 2. Save Profile
```javascript
function saveProfile(e) {
  if (e) e.preventDefault();
  
  const userSession = JSON.parse(localStorage.getItem('userSession'));
  userSession.name = document.getElementById('settingsName').value;
  userSession.email = document.getElementById('settingsEmail').value;
  userSession.phone = document.getElementById('settingsPhone').value;
  userSession.address = document.getElementById('settingsAddress').value;
  
  localStorage.setItem('userSession', JSON.stringify(userSession));
  alert('✅ Profile updated successfully!');
}
```

### 3. Load Orders
```javascript
function loadUserOrders() {
  const userOrders = JSON.parse(localStorage.getItem('userOrders')) || [];
  
  if (userOrders.length === 0) {
    // Show empty state
    return;
  }
  
  // Display orders
  userOrders.reverse().forEach(order => {
    // Render order card
  });
}
```

### 4. Logout All
```javascript
function logoutAllDevices() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userSession');
  localStorage.removeItem('userOrders');
  localStorage.removeItem('cartLocalCount');
  window.location.href = 'index.html';
}
```

---

## Summary Table

| Session Key | Data Type | Size | Persistence | Auto-Expires |
|-------------|-----------|------|-------------|--------------|
| `userSession` | JSON Object | ~500 bytes | Until logout | No |
| `userOrders` | JSON Array | ~5KB (varies) | Until logout | No |
| `isLoggedIn` | String Boolean | ~5 bytes | Until logout | No |
| `cartLocalCount` | String Number | ~2 bytes | Until logout | No |

---

## Recommendations for Technical Team

1. **Implement Server-Side Sessions**: Use server sessions (cookies with HttpOnly flag) for critical data
2. **API Integration**: Sync localStorage with backend API endpoints
3. **Session Timeout**: Implement automatic logout after inactivity
4. **Encryption**: Consider encrypting sensitive data in localStorage
5. **Error Handling**: Add try-catch for JSON parsing operations
6. **Testing**: Test multi-tab scenarios and session syncing
7. **Analytics**: Log session events for debugging

---

**Document Version**: 1.0  
**Last Updated**: March 12, 2026  
**Author**: Development Team
