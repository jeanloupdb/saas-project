const bcrypt = require('bcryptjs');

const password = 'client11';
const hashedPassword = '$2a$10$5eVFrB1YXhtwzS7DolTYeurPxHe50/u4/d7Z2RBMaLWc8pAABBgKC';

bcrypt.compare(password, hashedPassword, (err, result) => {
  if (err) {
    console.error('Error comparing passwords:', err);
  } else {
    console.log('Password match status:', result);
  }
});

