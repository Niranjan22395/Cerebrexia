import { getPool } from '../config/database';
import bcrypt from 'bcrypt';

async function seedAdmin() {
  const pool = getPool();
  
  try {
    console.log('🌱 Seeding admin user...');

    // Check if admin already exists
    const checkQuery = 'SELECT * FROM admin_users WHERE email = $1';
    const existing = await pool.query(checkQuery, ['admin@cerebrexia.com']);

    if (existing.rows.length > 0) {
      console.log('✅ Admin user already exists');
      console.log('📧 Email: admin@cerebrexia.com');
      console.log('🔑 Password: Admin@123');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // Insert admin user
    const insertQuery = `
      INSERT INTO admin_users (email, name, password_hash, role, phone, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, name, role
    `;

    const result = await pool.query(insertQuery, [
      'admin@cerebrexia.com',
      'Super Admin',
      hashedPassword,
      'super_admin',
      '+91-9999999999',
      true
    ]);

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@cerebrexia.com');
    console.log('🔑 Password: Admin@123');
    console.log('👤 Role: super_admin');
    console.log('\n🔐 Login credentials:');
    console.log('   Email: admin@cerebrexia.com');
    console.log('   Password: Admin@123');

  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedAdmin()
    .then(() => {
      console.log('\n✨ Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default seedAdmin;

// Made with Bob