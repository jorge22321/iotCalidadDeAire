/**
 * Genera una inicial a partir de un string (ideal para usernames).
 * Toma el primer carácter y lo convierte a mayúscula.
 * @param {string} text - El texto de entrada, como un username.
 * @returns {string} La inicial generada.
 */
export function getInitials(text) {
  // Si el texto no es válido o está vacío, retorna un placeholder.
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return '?'
  }

  // Toma el primer carácter del texto y lo pone en mayúscula.
  return text.trim()[0].toUpperCase()
}
