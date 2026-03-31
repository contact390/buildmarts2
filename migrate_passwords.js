const db = require('./db');
const bcrypt = require('bcrypt');

console.log('🔐 Starting password migration...');

// Get all salesman profiles with plain text passwords
db.query('SELECT id, password FROM salesman_profiles', (err, results) => {
  if (err) {
    console.error('❌ Error fetching profiles:', err);
    process.exit(1);
  }

  let updated = 0;
  let skipped = 0;

  if (results.length === 0) {
    console.log('✅ No profiles found');
    process.exit(0);
  }

  results.forEach((row) => {
    // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
    if (row.password.startsWith('$2')) {
      console.log(`⏭️  Skipping ID ${row.id} - already hashed`);
      skipped++;
    } else {
      // Hash the plain text password
      bcrypt.hash(row.password, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
          console.error(`❌ Error hashing password for ID ${row.id}:`, hashErr);
        } else {
          // Update database with hashed password
          db.query(
            'UPDATE salesman_profiles SET password = ? WHERE id = ?',
            [hashedPassword, row.id],
            (updateErr) => {
              if (updateErr) {
                console.error(`❌ Error updating ID ${row.id}:`, updateErr);
              } else {
                console.log(`✅ Updated ID ${row.id} with hashed password`);
                updated++;
              }

              // If all done, exit
              if (updated + skipped === results.length) {
                console.log(`\n🎉 Migration complete!`);
                console.log(`   Updated: ${updated}`);
                console.log(`   Skipped: ${skipped}`);
                process.exit(0);
              }
            }
          );
        }
      });
    }
  });
});
