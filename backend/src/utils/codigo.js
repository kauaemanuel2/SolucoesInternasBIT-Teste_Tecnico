// Formato SOL-00001 (padding de 5 dígitos).
module.exports = (id) => `SOL-${String(id).padStart(5, '0')}`;