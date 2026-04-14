(async ()=>{
  try {
<<<<<<< HEAD
    const res = await fetch('http://localhost:5000/api/cart/add', {
=======
    const res = await fetch('https://buildmarts.in/api/cart/add', {
>>>>>>> 446e9cc322e6defa7982f6adf5707b991ba2416f
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: { product_id: 9999, name: 'TEST PRODUCT', price: 1.5, qty: 1, image: '' } })
    });
    const j = await res.json();
    console.log(JSON.stringify(j, null, 2));
  } catch (e) {
    console.error('Request error:', e);
    process.exit(1);
  }
})();
