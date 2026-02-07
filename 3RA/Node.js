/**
 * Backend - Servidor Express con Node.js
 * Puerto: 3000
 * Base de datos: MySQL (boletin_digital)
 * 
 * Rutas disponibles:
 * - POST /api/login - Autenticación de usuarios
 * - GET /api/usuarios - Listar todos los usuarios
 * - POST /api/usuarios - Registrar nuevo usuario
 * - GET /api/usuarios/:dni - Obtener usuario por DNI
 * - PUT /api/usuarios/:dni - Actualizar usuario
 * - DELETE /api/usuarios/:dni - Eliminar usuario
 * - GET /api/alumnos/curso/:curso - Listar alumnos por curso
 * - POST /api/informes - Guardar notas
 * - GET /api/informes/:dni - Obtener notas de un alumno
 * - GET /api/notas/:dni/:curso - Obtener notas en curso específico
 */

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

const PORT = process.env.PORT || 3000;

// ====================================================
// CONFIGURACIÓN DE BASE DE DATOS
// ====================================================

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'boletin_digital'
});

db.connect(err => {
    if (err) {
        console.error('❌ Error al conectar MySQL:', err);
        process.exit(1);
    }
    console.log('✅ Conectado a MySQL.');
});


// ====================================================
// RUTAS DE AUTENTICACIÓN
// ====================================================

/**
 * POST /api/login
 * Autentica un usuario comparando credenciales con la BD
 * Retorna: dni, nombre_Apellido, id_tipo (1=alumno, 2=docente, 3=admin)
 */
// ====================================================
// RUTAS DE GESTIÓN DE USUARIOS (CRUD)
// ====================================================

/**
 * GET /api/usuarios
 * Retorna la lista de todos los usuarios registrados
 */

app.get('/api/informes/:dni', (req, res) => {
    const dni = req.params.dni;
    db.query('SELECT * FROM notas_informe WHERE estudiante_dni = ?', [dni], (err, results) => {
        if (err) {
            console.error('Error al consultar notas:', err);
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }
        res.json(results);
    });
});

// --- RUTA DE LOGIN (mantener tu lógica) ---
app.post('/api/login', (req, res) => {
    const { usuario, contraseña } = req.body;

    if (!usuario || !contraseña) {
        return res.status(400).json({ message: 'Por favor ingrese usuario y contraseña.' });
    }

    const sql = `
        SELECT dni, correo_Electronico, nombre_Apellido, id_tipo, contrasena
        FROM usuario
        WHERE dni = ? OR correo_Electronico = ?
    `;
    const values = [usuario, usuario];

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error de consulta en login:', err);
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const user = results[0];

        if (user.contrasena !== contraseña) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        res.json({
            message: 'Login exitoso',
            dni: user.dni,
            nombre: user.nombre_Apellido,
            id_tipo: user.id_tipo
        });
    });
});

app.get('/api/usuarios', (req, res) => {
    db.query('SELECT * FROM usuario', (err, results) => {
        if (err) {
            console.error('Consulta error:', err);
            return res.status(500).json({ error: 'Error interno' });
        }
        res.json(results);
    });
});

/**
 * GET /api/usuarios/curso/:curso
 * Retorna todos los usuarios (cualquier id_tipo) que pertenezcan al curso solicitado
 */
app.get('/api/usuarios/curso/:curso', (req, res) => {
    const cursoSel = req.params.curso;
    const sql = `SELECT * FROM usuario WHERE curso = ? ORDER BY nombre_Apellido`;
    db.query(sql, [cursoSel], (err, results) => {
        if (err) {
            console.error('Error al obtener usuarios por curso:', err);
            return res.status(500).json({ message: 'Error interno al buscar usuarios.' });
        }
        res.json(results);
    });
});

/**
 * GET /api/usuarios/:dni
 * Obtiene un usuario específico por su DNI
 */
app.get('/api/usuarios/:dni', (req, res) => {
    const dni = req.params.dni;
    db.query('SELECT * FROM usuario WHERE dni = ?', [dni], (err, results) => {
        if (err) {
            console.error('Error al buscar usuario:', err);
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.json(results[0]);
    });
});

/**
 * POST /api/usuarios
 * Registra un nuevo usuario (alumno, docente o admin)
 */
app.post('/api/usuarios', (req, res) => {
    const { nombre, dni, correo, contraseña, telefono, curso, id_tipo } = req.body;

    // Validación básica
    if (!nombre || !dni || !correo || !contraseña || !curso) {
        return res.status(400).json({ message: 'Faltan datos obligatorios.' });
    }

    const sql = `
        INSERT INTO usuario (nombre_Apellido, dni, correo_Electronico, contrasena, telefono, curso, id_tipo)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [nombre, dni, correo, contraseña, telefono || null, curso, id_tipo || 1];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error al registrar usuario:', err);
            return res.status(500).json({ message: 'Error interno al registrar.' });
        }
        res.status(201).json({ message: 'Usuario registrado correctamente.' });
    });
});

/**
 * PUT /api/usuarios/:dni
 * Actualiza los datos de un usuario existente
 */
app.put('/api/usuarios/:dni', (req, res) => {
    const dni = req.params.dni;
    const { nombre_Apellido, correo_Electronico, telefono, curso, id_tipo } = req.body;

    const sql = `
        UPDATE usuario
        SET nombre_Apellido = ?, correo_Electronico = ?, telefono = ?, curso = ?, id_tipo = ?
        WHERE dni = ?
    `;
    const values = [nombre_Apellido, correo_Electronico, telefono, curso, id_tipo, dni];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error al actualizar usuario:', err);
            return res.status(500).json({ message: 'Error interno al actualizar.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.json({ message: 'Usuario actualizado correctamente.' });
    });
});

/**
 * DELETE /api/usuarios/:dni
 * Elimina un usuario por su DNI
 */
app.delete('/api/usuarios/:dni', (req, res) => {
    const dni = req.params.dni;
    db.query('DELETE FROM usuario WHERE dni = ?', [dni], (err, result) => {
        if (err) {
            console.error('Error al eliminar usuario:', err);
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.json({ message: 'Usuario eliminado correctamente.' });
    });
});

// ====================================================
// RUTAS DE ALUMNOS
// ====================================================

/**
 * GET /api/alumnos/curso/:curso
 * Retorna la lista de alumnos (id_tipo = 1) para un curso específico
 */
app.get('/api/alumnos/curso/:curso', (req, res) => {
    const cursoSeleccionado = req.params.curso;

    const sql = `
        SELECT dni, nombre_Apellido 
        FROM usuario 
        WHERE curso = ? AND id_tipo = 1
        ORDER BY nombre_Apellido
    `;

    db.query(sql, [cursoSeleccionado], (err, results) => {
        if (err) {
            console.error('Error al obtener alumnos por curso:', err);
            return res.status(500).json({ message: 'Error interno al buscar alumnos.' });
        }
        res.json(results);
    });
});

// ====================================================
// RUTAS DE NOTAS E INFORMES
// ====================================================

/**
 * POST /api/informes
 * Guarda las notas de un alumno en múltiples materias
 * Esperado: { estudiante, docente, grado, materias: [{materia, notas: [7 valores]}] }
 */
app.post('/api/informes', (req, res) => {
    const { estudiante, docente, grado, materias } = req.body;

    if (!estudiante || !materias || materias.length === 0) {
        return res.status(400).json({ message: 'Faltan datos (estudiante o materias).' });
    }

    const values = materias.map(m => [
        estudiante,
        docente,
        grado,
        m.materia,
        m.notas[0] || null,
        m.notas[1] || null,
        m.notas[2] || null,
        m.notas[3] || null,
        m.notas[4] || null,
        m.notas[5] || null,
        m.notas[6] || null
    ]);

    const sql = `INSERT INTO notas_informe 
        (estudiante_dni, docente_nombre, grado, materia, 
        nota_p1_c1, nota_p2_c1, nota_c1, 
        nota_p1_c2, nota_p2_c2, nota_c2, nota_final) 
        VALUES ?`;

    db.query(sql, [values], (err, result) => {
        if (err) {
            console.error('❌ Error al guardar en DB:', err);
            return res.status(500).json({ message: 'Error interno de base de datos', detalles: err.message });
        }
        console.log(`✅ Se guardaron ${result.affectedRows} materias para ${estudiante}.`);
        res.status(201).json({ message: 'Notas guardadas correctamente' });
    });
});

/**
 * GET /api/informes/:dni
 * Obtiene todos los informes (notas) de un estudiante
 */
app.get('/api/informes/:dni', (req, res) => {
    const dni = req.params.dni;
    db.query('SELECT * FROM notas_informe WHERE estudiante_dni = ?', [dni], (err, results) => {
        if (err) {
            console.error('Error al consultar notas:', err);
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }
        res.json(results);
    });
});

/**
 * GET /api/notas/:dni/:curso
 * Obtiene las notas de un estudiante en un curso específico
 */
app.get('/api/notas/:dni/:curso', (req, res) => {
    const { dni, curso } = req.params;

    const sql = `
        SELECT 
            materia, 
            nota_p1_c1, 
            nota_p2_c1, 
            nota_c1, 
            nota_p1_c2, 
            nota_p2_c2, 
            nota_c2, 
            nota_final
        FROM notas_informe
        WHERE estudiante_dni = ? AND grado = ?
    `;

    db.query(sql, [dni, curso], (err, results) => {
        if (err) {
            console.error('Error al obtener notas:', err);
            return res.status(500).json({ message: 'Error interno al buscar notas.' });
        }
        res.json(results);
    });
});



// NUEVA RUTA: Verificar DNI para recuperación
app.get('/api/usuario/verificar/:dni', (req, res) => {
    const dni = req.params.dni;
    db.query('SELECT dni, telefono, curso, correo_Electronico FROM usuario WHERE dni = ?', [dni], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error de servidor' });
        if (results.length === 0) return res.status(404).json({ message: 'DNI no registrado' });
        res.json(results[0]);
    });
});

// NUEVA RUTA: Actualizar contraseña
app.put('/api/usuario/update-password', (req, res) => {
    const { dni, nuevaPass } = req.body;
    db.query('UPDATE usuario SET contrasena = ? WHERE dni = ?', [nuevaPass, dni], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al actualizar' });
        res.json({ message: 'Contraseña actualizada' });
    });
});

// --- NUEVA RUTA: Verificar DNI para recuperación ---
app.get('/api/usuario/verificar/:dni', (req, res) => {
    const { dni } = req.params;
    const query = 'SELECT dni, telefono, curso, correo_Electronico FROM usuario WHERE dni = ?';

    db.query(query, [dni], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en el servidor' });
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    });
});

// --- NUEVA RUTA: Actualizar Contraseña ---
app.put('/api/usuario/update-password', (req, res) => {
    const { dni, nuevaPass } = req.body;
    const query = 'UPDATE usuario SET contrasena = ? WHERE dni = ?';

    db.query(query, [nuevaPass, dni], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al actualizar' });
        res.json({ message: 'Contraseña actualizada correctamente' });
    });
});

// --- RUTA PARA ACCESO DE PADRES ---

app.post('/api/padres/consulta', (req, res) => {
    const { dni, tel } = req.body;

    // Buscamos el DNI y nombre del alumno (tipo 1) que coincida con el teléfono
    // La columna real en la tabla es `nombre_Apellido`, la retornamos como `nombre`.
    const query = 'SELECT dni, nombre_Apellido AS nombre FROM usuario WHERE dni = ? AND telefono = ? AND id_tipo = 1';

    db.query(query, [dni, tel], (err, results) => {
        if (err) {
            console.error("Error en la consulta:", err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }

        if (results.length > 0) {
            // Enviamos éxito y el nombre en un solo objeto JSON
            return res.json({ 
                success: true, 
                message: 'Acceso concedido',
                nombre: results[0].nombre 
            });
        } else {
            return res.status(401).json({ message: 'DNI o Teléfono no coinciden con ningún alumno' });
        }
    });
}); 

// ====================================================
// INICIAR SERVIDOR
// ====================================================

app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
