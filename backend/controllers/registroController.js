import { sendRegistrationDataEmail } from '../services/notificationService.js'

export const registrarUsuario = async (req, res) => {
  try {
    const formData = req.body
    const adminEmail = process.env.EMAIL_USER

    await sendRegistrationDataEmail(formData, adminEmail)

    res.status(200).json({
      message: 'Registro enviado correctamente y correo enviado.',
    })
  } catch (err) {
    console.error('❌ Error en registro:', err)
    res.status(500).json({ message: 'Error al procesar el registro.' })
  }
}
