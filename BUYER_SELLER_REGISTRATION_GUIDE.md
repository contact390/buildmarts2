# Buyer & Seller Registration System - Complete Guide

## System Overview

✅ **Separate Registration Systems:**
- Buyer registration: `/buyer-profile` endpoint
- Seller registration: `/seller-profile` endpoint

✅ **Shared Email Validation:**
- Same email CANNOT be used for both buyer and seller
- Duplicate emails are blocked across both tables

✅ **Data Storage:**
- Buyer data → `buyer_profiles` table
- Seller data → `seller_profiles` table

---

## Testing Guide

### Test Scenario 1: Buyer Registration (Success)

**Steps:**
1. Go to `buyer_register.html`
2. Fill in form with unique email:
   ```
   Name: John Buyer
   Email: johnbuyer123@example.com  (MUST BE UNIQUE)
   Phone: 9876543210
   Address: 123 Main Street
   Password: password123
   ```
3. Click Register

**Expected Result:**
- ✅ Green message: "Registration successful! Redirecting to login..."
- ✅ Page redirects to login after 2 seconds
- ✅ Server console shows:
  ```
  📝 Buyer registration attempt for: johnbuyer123@example.com
  ✅ Buyer registered successfully: johnbuyer123@example.com ID: 1
  📧 Email sent: ...
  ```

---

### Test Scenario 2: Seller Registration (Success)

**Steps:**
1. Go to `seller_register.html`
2. Fill in form with DIFFERENT unique email:
   ```
   Full Name: Jane Seller
   Email: janeseller456@example.com  (MUST BE DIFFERENT FROM BUYER EMAIL)
   Phone: 9876543211
   Company: ABC Trading Co
   Address: 456 Business Ave
   GST: 07AAACH0000A1Z5
   Password: password456
   ```
3. Click Submit Profile

**Expected Result:**
- ✅ Green message: "Registration successful! Redirecting to login..."
- ✅ Page redirects to login after 2 seconds (seller is automatically logged in)
- ✅ Server console shows:
  ```
  📝 Seller registration attempt for: janeseller456@example.com
  ✅ Seller registered successfully: janeseller456@example.com ID: 1
  📧 Email sent: ...
  ```

---

### Test Scenario 3: Duplicate Email Block (Buyer tries to register as Seller)

**Steps:**
1. First register as Buyer with: `testuser@example.com`
2. Then try to register as Seller with same email: `testuser@example.com`

**Expected Result:**
- ❌ Red message: "Email already registered as buyer or seller"
- ✅ Data is NOT stored in seller table
- ✅ Server console shows:
  ```
  📝 Seller registration attempt for: testuser@example.com
  ⚠️ Email already registered: testuser@example.com
  ```

---

### Test Scenario 4: Duplicate Email Block (Seller tries to register as Buyer)

**Steps:**
1. First register as Seller with: `seller@example.com`
2. Then try to register as Buyer with same email: `seller@example.com`

**Expected Result:**
- ❌ Red message: "Email already registered as buyer or seller"
- ✅ Data is NOT stored in buyer table
- ✅ Server console shows:
  ```
  📝 Buyer registration attempt for: seller@example.com
  ⚠️ Email already registered: seller@example.com
  ```

---

### Test Scenario 5: Invalid Phone Number

**Steps:**
1. Go to Buyer Registration
2. Fill form but use invalid phone: `1234567890` (not starting with 6-9)
3. Click Register

**Expected Result:**
- ❌ Red message: "Please enter a valid 10-digit mobile number starting with 6-9"
- ✅ Form NOT submitted
- ✅ No database call made

---

### Test Scenario 6: Missing Required Fields

**Steps:**
1. Leave any required field empty
2. Click Register

**Expected Result:**
- ❌ Red message: "Please fill in all required fields"
- ✅ Form NOT submitted

---

### Test Scenario 7: Short Password

**Steps:**
1. Fill buyer form with password: `123` (less than 6 characters)
2. Click Register

**Expected Result:**
- ❌ Red message: "Password must be at least 6 characters long"
- ✅ Form NOT submitted

---

## Database Verification

### Check Buyer Registrations:
```sql
SELECT * FROM buyer_profiles;
```

**Expected columns:**
- id (auto-increment)
- name
- email (UNIQUE)
- phone
- address
- password
- created_at (TIMESTAMP)

---

### Check Seller Registrations:
```sql
SELECT * FROM seller_profiles;
```

**Expected columns:**
- id (auto-increment)
- name
- email (UNIQUE)
- phone
- company
- address
- gst
- password
- created_at (TIMESTAMP)

---

### Check No Duplicate Emails Across Tables:
```sql
SELECT email FROM buyer_profiles
UNION
SELECT email FROM seller_profiles
GROUP BY email HAVING COUNT(*) > 1;
```

**Expected Result:** Empty result set (no duplicates)

---

## Test Data to Use

### Unique Buyer Emails:
- buyer1@test.com
- buyer2@test.com
- buyer3@test.com
- john.doe@example.com
- jane.smith@example.com

### Unique Seller Emails:
- seller1@test.com
- seller2@test.com
- seller3@test.com
- business1@example.com
- business2@example.com

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Email already registered" | Email used before | Use a different, unique email |
| "Server error 500" | Server not running | Start server with `node server.js` |
| "Unable to reach server" | Wrong API endpoint | Check port 5000 is running |
| Silent failure | Old script version | Hard refresh browser (Ctrl+Shift+R) |
| No success message | Browser caching | Clear cache or use incognito mode |

---

## Email Validation Rules

✅ **Valid emails:**
- testuser@example.com
- user+tag@domain.co.uk
- name.surname@company.org

❌ **Invalid emails:**
- testuser (missing @)
- @example.com (missing username)
- testuser@.com (missing domain)

---

## Phone Validation Rules

✅ **Valid phones (India):**
- 6000000000
- 7999999999
- 8555555555
- 9123456789

❌ **Invalid phones:**
- 5999999999 (starts with 5)
- 9876543210 (must start with 6-9)
- 123456789 (less than 10 digits)

---

## Password Rules

✅ **Valid passwords:**
- password123 (at least 6 chars)
- MySecure@Pass (special chars OK)
- 123456

❌ **Invalid passwords:**
- pass (less than 6 chars)
- 12345 (exactly 5 chars)

---

## Server Console Output Examples

### Successful Buyer Registration:
```
📝 Buyer registration attempt for: newbuyer@example.com
✅ Buyer registered successfully: newbuyer@example.com ID: 5
📧 Email sent: 250 OK
```

### Successful Seller Registration:
```
📝 Seller registration attempt for: newseller@example.com
✅ Seller registered successfully: newseller@example.com ID: 3
📧 Email sent: 250 OK
```

### Duplicate Email Error:
```
📝 Buyer registration attempt for: existing@example.com
⚠️ Email already registered: existing@example.com
```

### Validation Error:
```
❌ Validation failed - Missing required fields
```

---

## Login After Registration

After successful registration, users are redirected to `login.html`

**Login credentials:**
- Email: (same as registered)
- Password: (same as registered)
- User Type: Buyer or Seller (radio buttons)

---

## Session Management

✅ After login, session is stored with:
- User ID
- User Name
- User Email
- User Type (buyer/seller)

✅ Session persists for 24 hours (can be configured in server.js)

✅ Logout clears session and cookies
