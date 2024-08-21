// utils/codeGenerator.js

const generatePickupCode = () => {
    // Génère un code aléatoire de 8 caractères (par exemple)
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };
  
  module.exports = {
    generatePickupCode,
  };
  