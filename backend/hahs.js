import bcrypt from 'bcrypt'

async function hashPassword(plainPassword) {
  try {
    const saltRounds = 10 // Factor de costo. 10 es un buen valor por defecto.
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds)
    return hashedPassword
  } catch (error) {
    console.error('Error al hashear la contraseña:', error)
    throw error
  }
}

// --- Ejemplo de uso ---
const myPassword = '123456'

hashPassword(myPassword).then((hash) => {
  console.log('Contraseña original:', myPassword)
  console.log('Contraseña hasheada:', hash)
  // Este 'hash' es el que guardarías en tu base de datos
})
