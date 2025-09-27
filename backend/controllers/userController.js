// backend/controllers/userController.js
import pool from '../database/mysql.js'
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'

/* ============================================================
   CREAR USUARIO
   ============================================================
   Flujo:
   1. Validar campos obligatorios
   2. Comprobar duplicados (username/email)
   3. Encriptar contraseña con bcrypt
   4. Guardar en la base de datos
   5. Responder con ID del nuevo usuario
============================================================ */

/**
 * Crea un nuevo usuario en la base de datos
 * @body {string} username
 * @body {string} email
 * @body {string} password
 * @body {number} role_id
 * @body {string} [first_name]
 * @body {string} [last_name]
 * @body {string} [phone_number]
 * @body {string} [country]
 * @body {string} [province]
 * @body {string} [district]
 * @body {number} [age]
 * @body {string} [dni]
 */
export const createUser = async (req, res) => {
  try {
    const {
      username,
      email,
      first_name,
      last_name,
      phone_number,
      country,
      province,
      district,
      age,
      dni,
      password,
      role_id,
      send_notification,
    } = req.body

    /* --------------------------
       1. Validación de obligatorios
    ----------------------------- */
    if (!username || !email || !password || !role_id) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios: username, email, password, role_id',
      })
    }

    /* --------------------------
       2. Validar duplicados
    ----------------------------- */
    const [exists] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1',
      [username, email],
    )
    if (exists.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'El nombre de usuario o correo ya existe',
      })
    }

    /* --------------------------
       3. Encriptar contraseña
    ----------------------------- */
    const hashedPassword = await bcrypt.hash(password, 10)

    /* --------------------------
       4. Insertar en base de datos
    ----------------------------- */
    const [result] = await pool.query(
      `INSERT INTO users (
        username, email, password, first_name, last_name,
        phone_number, country, province, district, age, dni, role_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        username,
        email,
        hashedPassword,
        first_name || null,
        last_name || null,
        phone_number || null,
        country || null,
        province || null,
        district || null,
        age || null,
        dni || null,
        role_id,
      ],
    )

    /* --------------------------
       5. Respuesta
    ----------------------------- */
    if (send_notification) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          secure: process.env.EMAIL_SECURE === 'true',
          service: 'gmail', // puedes usar otro proveedor o SMTP propio
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        })

        await transporter.sendMail({
          from: `"Soporte - Iot-App" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Tu cuenta ha sido creada ✅',
          html: `
            <h2>Bienvenido/a, ${first_name || username} 👋</h2>
            <p>Tu cuenta ha sido creada con éxito.</p>
            <p><b>Usuario:</b> ${username}</p>
            <p><b>Contraseña:</b> ${password}</p>
            <br/>
            <p>Puedes iniciar sesión en la plataforma.</p>
          `,
        })

        console.log(`📩 Correo enviado a ${email}`)
      } catch (mailError) {
        console.error('⚠️ Error al enviar correo:', mailError.message)
        // Nota: no hacemos return aquí, porque el usuario ya fue creado
      }
    }

    // 6. Respuesta final
    res.status(201).json({
      success: true,
      message: 'Usuario creado con éxito',
      user_id: result.insertId,
    })
  } catch (error) {
    console.error('❌ Error al crear usuario:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    })
  }
}
