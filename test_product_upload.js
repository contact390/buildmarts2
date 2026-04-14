// test_product_upload.js
// Quick test script for product upload API

const http = require('http');
const fs = require('fs');
const path = require('path');

// Test data for different categories
const testProducts = {
  cement: {
    productName: 'Ultratech Cement Grade 53',
    brand: 'Ultratech',
    category: 'cement',
    description: 'High strength Portland cement for construction',
    price: '380',
    discount: '5',
    quantity: '1',
    quantityUnit: 'bag',
    rating: '4.5',
    moq: '1',
    warranty: '0',
    color: 'Grey',
    cementType: 'opc',
    grade: '53',
    settingTime: '30',
    compressiveStrength: '53'
  },
  
  bricks: {
    productName: 'Clay Bricks Standard Size',
    brand: 'Local Bricks',
    category: 'bricks',
    description: 'Standard size clay bricks for wall construction',
    price: '250',
    discount: '0',
    quantity: '1000',
    quantityUnit: '1000-piece',
    rating: '4',
    moq: '500',
    warranty: '0',
    color: 'Red',
    brickType: 'clay',
    size: '9x4.5x3',
    weight: '2.5',
    compressiveStrength: '10'
  },
  
  plumbing: {
    productName: 'PVC Pipe 25mm',
    brand: 'Finolex',
    category: 'plumbing',
    description: 'Standard PVC plumbing pipe',
    price: '45',
    discount: '5',
    quantity: '1',
    quantityUnit: 'meter',
    rating: '4.5',
    moq: '10',
    warranty: '5',
    plumbingType: 'pipe',
    material: 'pvc',
    diameter: '25mm',
    pressureRating: '150'
  },
  
  iron: {
    productName: 'TMT Bar Fe500 12mm',
    brand: 'SAIL',
    category: 'iron-steel',
    description: 'Thermomechanically Treated Steel Bar',
    price: '45',
    discount: '0',
    quantity: '1',
    quantityUnit: 'kg',
    rating: '4.5',
    moq: '1',
    warranty: '0',
    steelType: 'tmt',
    diameter: '12',
    grade: 'fe500',
    yieldStrength: '500'
  }
};

// Test GET requests
async function testGetRequests() {
  console.log('\n📋 Testing GET Endpoints...\n');

  // Test 1: Get all products
  console.log('1️⃣ GET /api/product_uploads');
  try {
<<<<<<< HEAD
    const response = await fetch('http://localhost:5000/api/product_uploads?limit=5');
=======
    const response = await fetch('https://buildmarts.in/api/product_uploads?limit=5');
>>>>>>> 446e9cc322e6defa7982f6adf5707b991ba2416f
    const data = await response.json();
    console.log(`✅ Success: Found ${data.total} products`);
    if (data.products.length > 0) {
      console.log(`   First product: ${data.products[0].productName}`);
    }
  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
  }

  // Test 2: Get by category
  console.log('\n2️⃣ GET /api/product_uploads/category/cement');
  try {
<<<<<<< HEAD
    const response = await fetch('http://localhost:5000/api/product_uploads/category/cement?limit=5');
=======
    const response = await fetch('https://buildmarts.in/api/product_uploads/category/cement?limit=5');
>>>>>>> 446e9cc322e6defa7982f6adf5707b991ba2416f
    const data = await response.json();
    console.log(`✅ Success: Found ${data.total} cement products`);
  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
  }

  // Test 3: Get specific product (if exists)
  console.log('\n3️⃣ GET /api/product_uploads/1');
  try {
<<<<<<< HEAD
    const response = await fetch('http://localhost:5000/api/product_uploads/1');
=======
    const response = await fetch('https://buildmarts.in/api/product_uploads/1');
>>>>>>> 446e9cc322e6defa7982f6adf5707b991ba2416f
    if (response.status === 404) {
      console.log('⚠️ Product not found (expected if no products uploaded)');
    } else {
      const data = await response.json();
      console.log(`✅ Success: ${data.product.productName}`);
    }
  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
  }
}

// Test POST request (upload product)
async function testUploadProduct() {
  console.log('\n\n📤 Testing POST Upload Endpoint...\n');

  const formData = new FormData();
  
  // Use cement test data
  const product = testProducts.cement;
  
  // Add all fields
  Object.keys(product).forEach(key => {
    formData.append(key, product[key]);
  });

  // Create a simple test image (1x1 pixel PNG)
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xF8, 0x0F, 0x00, 0x00,
    0x01, 0x01, 0x00, 0x01, 0x18, 0xDD, 0x8D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
    0xAE, 0x42, 0x60, 0x82
  ]);

  // For Node.js testing, you'd need to use a different approach
  // This is more for browser testing with the HTML form
  
  console.log('✅ Product data prepared:');
  console.log(`   Product Name: ${product.productName}`);
  console.log(`   Category: ${product.category}`);
  console.log(`   Price: ₹${product.price}`);
  console.log(`   Discount: ${product.discount}%`);
  console.log('\n⚠️ Note: File upload test requires browser environment');
  console.log('   Use productslatestuploads.html form to test with actual image');
}

// Display API endpoints
function displayEndpoints() {
  console.log('\n\n📚 Available API Endpoints:\n');
  
  console.log('GET  /api/product_uploads              - Get all products');
  console.log('GET  /api/product_uploads/:id          - Get single product');
  console.log('GET  /api/product_uploads/category/:category - Get by category');
  console.log('POST /api/product_uploads              - Upload new product (multipart)');
  console.log('PUT  /api/product_uploads/:id          - Update product (multipart)');
  console.log('DELETE /api/product_uploads/:id        - Delete product\n');

  console.log('📂 Database Table: products_extended\n');
  
  console.log('🏷️  Categories:');
  console.log('   - cement');
  console.log('   - bricks');
  console.log('   - building-materials');
  console.log('   - iron-steel');
  console.log('   - plumbing');
  console.log('   - home-interior\n');
}

// Run tests
async function runTests() {
  console.log('🔧 Product Upload API - Test Suite\n');
<<<<<<< HEAD
  console.log('🌍 Base URL: http://localhost:5000/api\n');
=======
  console.log('🌍 Base URL: https://buildmarts.in/api\n');
>>>>>>> 446e9cc322e6defa7982f6adf5707b991ba2416f
  console.log('⚠️  Make sure server is running: node server.js\n');
  
  displayEndpoints();
  
  await testGetRequests();
  await testUploadProduct();
  
  console.log('\n\n✨ Test complete!\n');
<<<<<<< HEAD
  console.log('📝 Frontend Form: http://localhost:5000/productslatestuploads.html');
=======
  console.log('📝 Frontend Form: https://buildmarts.in/productslatestuploads.html');
>>>>>>> 446e9cc322e6defa7982f6adf5707b991ba2416f
  console.log('📖 API Docs: See PRODUCT_UPLOAD_API.md\n');
}

// Run if executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testProducts, testGetRequests, testUploadProduct };
