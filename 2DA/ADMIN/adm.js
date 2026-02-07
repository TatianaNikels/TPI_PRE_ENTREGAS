/**
 * admin JS - Gestión de usuarios (frontend)
 * Archivo: adm.js
 * - Provee funciones para listar, editar y eliminar usuarios.
 * - Utiliza la API en `http://localhost:3000/api/usuarios`.
 */
const API_BASE_URL = 'http://localhost:3000/api/usuarios';

/**
 * Convierte el identificador numérico de tipo de usuario
 * a una representación textual legible.
 * @param {string|number} idTipo - id numérico del tipo de usuario
 * @returns {string} - Nombre legible del tipo
 */
function getNombreTipo(idTipo) {
    switch (String(idTipo)) {
        case '1':
            return 'Alumno/a';
        case '2':
            return 'Docente';
        case '3':
            return 'Dto_Alumnado';
        default:
            return 'Desconocido';
    }
}

// ==========================================================
// Modal de confirmación (única definición, sin duplicados)
// ==========================================================
const deleteConfirmationModal = document.getElementById('deleteConfirmationModal');
const closeDeleteModalBtn = deleteConfirmationModal ? deleteConfirmationModal.querySelector('.modal-confirmation-close-btn') : null;
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

let dniToDelete = null; // Variable para guardar el DNI del usuario a eliminar

/**
 * Muestra el modal de confirmación para eliminar un usuario.
 * Guarda el `dni` en `dniToDelete` para su uso posterior.
 * @param {string} dni - DNI del usuario a eliminar
 */
function showDeleteConfirmationModal(dni) {
    dniToDelete = dni;
    if (deleteConfirmationModal) deleteConfirmationModal.style.display = 'flex';
}

/**
 * Oculta el modal de confirmación y limpia la variable `dniToDelete`.
 */
function hideDeleteConfirmationModal() {
    if (deleteConfirmationModal) deleteConfirmationModal.style.display = 'none';
    dniToDelete = null;
}

if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async () => {
        if (!dniToDelete) return;
        try {
            const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(dniToDelete)}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const text = await response.text();
                let message = 'Error al eliminar usuario.';
                try {
                    const data = JSON.parse(text);
                    message = data.error || data.message || message;
                } catch (e) {
                    if (text) message = text;
                }
                throw new Error(message);
            }

            hideDeleteConfirmationModal();
            cargarUsuarios();
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            alert(`Error: ${error.message}`);
            hideDeleteConfirmationModal();
        }
    });
}

if (closeDeleteModalBtn) closeDeleteModalBtn.addEventListener('click', hideDeleteConfirmationModal);
if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', hideDeleteConfirmationModal);

window.addEventListener('click', (event) => {
    if (event.target === deleteConfirmationModal) {
        hideDeleteConfirmationModal();
    }
});
// ==========================================================
// Fin modal
// ==========================================================

/**
 * Solicita al backend la lista de usuarios y la muestra en la tabla.
 * Maneja errores mostrando un mensaje dentro de la tabla si falla la petición.
 */
/**
 * Carga usuarios desde la API. Si se recibe `curso`, intentará usar
 * la ruta específica `/curso/:curso`. Si no existe, cae en la ruta base.
 * @param {string} [curso]
 */
function cargarUsuarios(curso) {
    let url = API_BASE_URL;
    if (curso) {
        url = `${API_BASE_URL}/curso/${encodeURIComponent(curso)}`;
    }

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Error al obtener datos de la API');
            return response.json();
        })
        .then(data => mostrarUsuariosEnTabla(data))
        .catch(error => {
            console.error('Fetch error:', error);
            const tablaBody = document.getElementById('cuerpo-tabla-usuarios');
            if (tablaBody) {
                tablaBody.innerHTML = `
                    <tr>
                        <td colspan="9" style="text-align:center; padding:16px; color:#888;">
                            Error al cargar datos. Verifica el servidor y la conexión.
                        </td>
                    </tr>
                `;
            }
        });
}

/**
 * Renderiza la lista de usuarios dentro del cuerpo de la tabla en `adm.html`.
 * @param {Array<Object>} usuarios - Lista de objetos usuario recibidos del servidor
 */
function mostrarUsuariosEnTabla(usuarios) {
    const tablaBody = document.getElementById('cuerpo-tabla-usuarios');
    if (!tablaBody) return;
    tablaBody.innerHTML = '';

    if (!Array.isArray(usuarios) || usuarios.length === 0) {
        tablaBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center; padding:16px; color:#888;">
                    No hay usuarios registrados.
                </td>
            </tr>
        `;
        return;
    }

    usuarios.forEach((usuario, index) => {
        const fila = tablaBody.insertRow();
        const numero = index + 1;

        /*columna N°*/
        const celdaNum = fila.insertCell();
        celdaNum.textContent = numero;
        celdaNum.className = 'user-table-num';

        fila.insertCell().textContent = usuario.nombre_Apellido ?? '';
        fila.insertCell().textContent = usuario.dni ?? '';
        fila.insertCell().textContent = usuario.correo_Electronico ?? '';
        fila.insertCell().textContent = usuario.telefono ?? '';
        fila.insertCell().textContent = usuario.curso ?? '';

        const nombreTipo = getNombreTipo(usuario.id_tipo);
        fila.insertCell().textContent = nombreTipo;

        const fechaCruda = usuario.fecha_registro ? new Date(usuario.fecha_registro) : null;
        const fechaFormateada = fechaCruda ? fechaCruda.toLocaleDateString() : 'N/A';
        fila.insertCell().textContent = fechaFormateada;

        const celdaAcciones = fila.insertCell();

        const btnEditar = document.createElement('button');
        btnEditar.textContent = '✏️ Editar';
        btnEditar.className = 'btn-editar';
        btnEditar.dataset.dni = usuario.dni;
        btnEditar.addEventListener('click', () => abrirModalEdicion(usuario.dni));
        celdaAcciones.appendChild(btnEditar);

        const btnEliminar = document.createElement('button');
        btnEliminar.textContent = '🗑️ Eliminar';
        btnEliminar.className = 'btn-eliminar';
        // Abrir modal de confirmación en lugar de confirm()
        btnEliminar.addEventListener('click', () => showDeleteConfirmationModal(usuario.dni));
        celdaAcciones.appendChild(btnEliminar);
    });
}

/**
 * Elimina un usuario llamando a la API. (Función de compatibilidad)
 * Muestra confirm dialog y luego realiza la petición DELETE.
 * @param {string} dniUsuario - DNI del usuario a eliminar
 */
function eliminarUsuario(dniUsuario) {
    if (!dniUsuario) return;
    if (!confirm(`¿Eliminar usuario con DNI ${dniUsuario}?`)) return;

    fetch(`${API_BASE_URL}/${encodeURIComponent(dniUsuario)}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) return response.json().then(err => Promise.reject(err));
            return response.json();
        })
        .then(() => {
            alert('Usuario eliminado correctamente.');
            cargarUsuarios();
        })
        .catch(error => {
            console.error('Error eliminar:', error);
            alert('No se pudo eliminar el usuario. Ver consola.');
        });
}

/**
 * Abre el modal de edición y carga los datos del usuario desde la API.
 * Rellena los campos del formulario con los valores recibidos.
 * @param {string} dniUsuario - DNI del usuario a editar
 */
function abrirModalEdicion(dniUsuario) {
    if (!dniUsuario) return;
    const modalEdicion = document.getElementById('modal-edicion');
    fetch(`${API_BASE_URL}/${encodeURIComponent(dniUsuario)}`)
        .then(res => {
            if (!res.ok) throw new Error('No se encontró el usuario');
            return res.json();
        })
        .then(usuario => {
            if (document.getElementById('edit-dni-oculto')) {
                document.getElementById('edit-dni-oculto').value = usuario.dni || '';
            }
            if (document.getElementById('edit-nombre')) {
                document.getElementById('edit-nombre').value = usuario.nombre_Apellido || '';
            }
            if (document.getElementById('edit-correo')) {
                document.getElementById('edit-correo').value = usuario.correo_Electronico || '';
            }
            if (document.getElementById('edit-telefono')) {
                document.getElementById('edit-telefono').value = usuario.telefono || '';
            }
            if (document.getElementById('edit-curso')) {
                document.getElementById('edit-curso').value = usuario.curso || '';
            }
            if (document.getElementById('edit-id-tipo')) {
                document.getElementById('edit-id-tipo').value = usuario.id_tipo ?? '';
            }
            if (modalEdicion) modalEdicion.style.display = 'flex';
        })
        .catch(err => {
            console.error('Error cargar usuario para edición:', err);
            alert('No se pudo cargar los datos para edición.');
        });
}

/**
 * Envía los datos modificados del usuario al backend usando PUT.
 * Cierra el modal y refresca la lista en caso de éxito.
 * @param {string} dniUsuario - DNI del usuario a actualizar
 * @param {Object} nuevosDatos - Campos a actualizar
 */
function guardarEdicionUsuario(dniUsuario, nuevosDatos) {
    if (!dniUsuario || !nuevosDatos) return;
    fetch(`${API_BASE_URL}/${encodeURIComponent(dniUsuario)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevosDatos)
    })
        .then(res => {
            if (!res.ok) return res.json().then(err => Promise.reject(err));
            return res.json();
        })
        .then(() => {
            const modalEdicion = document.getElementById('modal-edicion');
            if (modalEdicion) modalEdicion.style.display = 'none';
            cargarUsuarios();
        })
        .catch(err => {
            console.error('Error actualizar usuario:', err);
            alert('No se pudo actualizar el usuario.');
        });
}

function manejarEnvioEdicion(event) {
    event.preventDefault();
    const dni = document.getElementById('edit-dni-oculto')?.value;
    const nuevosDatos = {
        nombre_Apellido: document.getElementById('edit-nombre')?.value,
        correo_Electronico: document.getElementById('edit-correo')?.value,
        telefono: document.getElementById('edit-telefono')?.value,
        curso: document.getElementById('edit-curso')?.value,
        id_tipo: document.getElementById('edit-id-tipo')?.value
    };
    if (!dni) return alert('DNI inválido.');
    guardarEdicionUsuario(dni, nuevosDatos);
}

document.addEventListener('DOMContentLoaded', () => {
    const formEdicion = document.getElementById('form-edicion-usuario');
    if (formEdicion) formEdicion.addEventListener('submit', manejarEnvioEdicion);
    // Inicializar filtro por curso si existe el select
    const filtroCurso = document.getElementById('filter-curso');
    if (filtroCurso) {
        // Al cambiar el select, recargar usuarios filtrando por curso
        filtroCurso.addEventListener('change', () => {
            const curso = filtroCurso.value || '';
            cargarUsuarios(curso);
        });
        // Cargar inicialmente según el valor actual (o todos si vacío)
        cargarUsuarios(filtroCurso.value || '');
    } else {
        // Comportamiento por defecto: cargar todos
        cargarUsuarios();
    }
});


