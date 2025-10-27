// backend/services/notificationService.js
import nodemailer from 'nodemailer'

// --- 1. Configura el "transportador" de correo una sola vez ---
// Este objeto se reutilizará para todos los correos de la aplicación.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true', // true para el puerto 465
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

/**
 * ==========================================================
 * FUNCIÓN 1: Enviar correo de bienvenida y configuración
 * ==========================================================
 * @param {object} user - Objeto con { email, first_name, username }
 * @param {string} tempPassword - La contraseña temporal generada
 * @param {string} setupUrl - El enlace para configurar la contraseña definitiva
 */
export const sendWelcomeEmail = async (user, tempPassword, setupUrl) => {
  const recipientName = user.first_name || user.username

  try {
    await transporter.sendMail({
      from: `"Soporte - Iot-App" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Bienvenido y configura tu cuenta ✅',
      html: `
        <h2>Bienvenido/a, ${recipientName} 👋</h2>
        <p>Tu cuenta ha sido creada con éxito. Para empezar, por favor, establece tu contraseña personal.</p>
        <p><b>Usuario:</b> ${user.username}</p>
        <p><b>Contraseña Temporal:</b> ${tempPassword}</p>
        <br/>
        <p>Haz clic en el siguiente enlace para configurar tu contraseña definitiva. El enlace es válido por 24 horas.</p>
        <a href="${setupUrl}" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Establecer mi Contraseña</a>
        <br/><br/>
        <p>Si el botón no funciona, copia y pega esta URL en tu navegador:</p>
        <p>${setupUrl}</p>
      `,
    })
    console.log(`📩 Correo de configuración enviado a ${user.email}`)
  } catch (error) {
    console.error(`⚠️ Error al enviar correo de bienvenida a ${user.email}:`, error.message)
  }
}

/**
 * ==========================================================
 * FUNCIÓN 2: Enviar correo de alerta por CO2 elevado
 * ==========================================================
 * @param {object} user - Objeto con { email, first_name, username }
 * @param {number} co2Value - El valor de CO2 que disparó la alerta
 */
export const sendCO2AlertEmail = async (user, co2Value) => {
  const recipientName = user.first_name || user.username

  try {
    await transporter.sendMail({
      from: `"Alerta de Sensores - Iot-App" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🔴 ¡Alerta! Nivel de CO2 Elevado',
      html: `
        <h2>Hola, ${recipientName} 👋</h2>
        <p>Se ha detectado un nivel de Dióxido de Carbono (CO2) que supera el umbral de seguridad.</p>
        <p style="font-size: 18px;">
            <b>Valor Registrado:</b> 
            <span style="color: #d93025; font-weight: bold;">${co2Value.toFixed(2)} PPM</span>
        </p>
        
        <br/>
        <p>Por favor, tome las medidas de precaución necesarias, como ventilar el área.</p>
      `,
    })
    console.log(`✅ Alerta de CO2 enviada a ${user.email}`)
  } catch (error) {
    console.error(`❌ Error al enviar alerta de CO2 a ${user.email}:`, error.message)
  }
}

/**
 * ==========================================================
 * 🧾 FUNCIÓN 3: Enviar correo con datos de registro adjuntos (.txt)
 * ==========================================================
 * @param {object} formData - Datos completos del formulario
 * @param {string} toEmail - Dirección de destino (ej: admin)
 */
export const sendRegistrationDataEmail = async (formData, toEmail) => {
  try {
    // 🧩 1. Formatear datos del registro como texto legible
    const formattedText = `
=== SOLICITUD DE REGISTRO ===

Nombre: ${formData.nombre}
Apellido: ${formData.apellido}
Teléfono: ${formData.telefono}
País: ${formData.pais}
Provincia: ${formData.provincia}
Distrito: ${formData.distrito}
Edad: ${formData.edad}
DNI: ${formData.dni}
Usuario: ${formData.usuario}
Correo: ${formData.correo}

Fecha de Envio: ${new Date().toLocaleString()}
====================================
    `.trim()

    // 🧷 2. Enviar correo con el archivo adjunto .txt
    await transporter.sendMail({
      from: `"Notificaciones - Iot-App" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: '📋 Nueva Solicitud de Registro',
      text: 'Adjunto encontrarás los datos de la nueva solicitud de registro realizado en la aplicación.',
      attachments: [
        {
          filename: `registro_${formData.usuario || 'usuario'}.txt`,
          content: formattedText,
        },
      ],
    })

    console.log(`📤 Correo con registro enviado a ${toEmail}`)
  } catch (error) {
    console.error(`⚠️ Error al enviar datos de registro:`, error.message)
  }
}
