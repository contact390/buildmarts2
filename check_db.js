const db = require('./db');

db.query('SELECT * FROM salesman_profiles', (err, results) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Salesman Profiles:');
    console.table(results);
  }
  process.exit(0);
});
