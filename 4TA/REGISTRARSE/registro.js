const API_REGISTRO_URL = 'http://localhost:3000/api/usuarios';

document.addEventListener('DOMContentLoaded', () => {
    const formRegistro = document.getElementById('registro-form');
    if (formRegistro) {
        formRegistro.addEventListener('submit', manejarRegistro);
    }
});

// Función central para mostrar/ocultar errores en cualquier campo
function toggleError(campoId, errorTextId, isError) {
    const group = document.getElementById(campoId + '-group');
    const errorMsg = document.getElementById(errorTextId);
    
    if (group && errorMsg) {
        if (isError) {
            group.classList.add('input-error');
            errorMsg.style.display = 'block';
        } else {
            group.classList.remove('input-error');
            errorMsg.style.display = 'none';
        }
    }
}

function manejarRegistro(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    let hayErrores = false;
    let primerCampoError = null;

    // 1. Definimos los campos que validaremos (Input ID y Texto del error)
    const campos = [
        { id: 'nombre', errorId: 'nombre-error', valor: data.nombre, esSelect: false },
        { id: 'dni', errorId: 'dni-error', valor: data.dni, esSelect: false },
        { id: 'correo', errorId: 'correo-error', valor: data.correo, esSelect: false },
        { id: 'contraseña', errorId: 'contraseña-error', valor: data.contraseña, esSelect: false },
        { id: 'curso', errorId: 'curso-error', valor: data.curso, esSelect: true } // El select
    ];

    // 2. Itera sobre los campos para la validación de VACÍO
    campos.forEach(campo => {
        const valorLimpio = campo.valor ? campo.valor.trim() : '';
        
        // Verifica si el campo está vacío (incluye el select con valor="")
        const estaVacio = !valorLimpio; 

        if (estaVacio) {
            toggleError(campo.id, campo.errorId, true); // Muestra el error
            hayErrores = true;
            if (!primerCampoError) {
                primerCampoError = document.getElementById(campo.id + (campo.esSelect ? '-select' : '-input'));
            }
        } else {
            toggleError(campo.id, campo.errorId, false); // Oculta el error
        }
    });

    // 3. Validación específica para TELÉFONO (Solo dígitos)
    const telefonoId = 'telefono';
    const telefonoValor = data.telefono ? data.telefono.trim() : '';
    const soloDigitos = /^\d+$/;

    if (!telefonoValor || !soloDigitos.test(telefonoValor)) {
        toggleError(telefonoId, 'telefono-error', true); // Muestra error de teléfono
        hayErrores = true;
        if (!primerCampoError) {
            primerCampoError = document.getElementById('telefono-input');
        }
    } else {
        toggleError(telefonoId, 'telefono-error', false); // Oculta error de teléfono
    }

    // 4. Detener si hay errores y enfocar el primer campo con error
    if (hayErrores) {
        if (primerCampoError) {
            primerCampoError.focus();
        }
        return; // Detiene la función, no se envía el formulario
    }

    // Si llegamos aquí, NO hay errores de validación, procedemos al FETCH...

    // Asignar id_tipo = 1
    data.id_tipo = 1;

    fetch(API_REGISTRO_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) return response.json().then(err => Promise.reject(err));
            return response.json();
        })
        .then(() => {
            // Muestra el mensaje de éxito temporal
            const mensajeExito = document.getElementById('mensaje-exito');
            mensajeExito.classList.add('mostrar');

            // Redirige DESPUÉS de 2 segundos
            setTimeout(() => {
                mensajeExito.classList.remove('mostrar');
                window.location.href = 'index.html';
            }, 2000);

        })
        .catch(error => {
            console.error('Error registro:', error);
            alert('Error al registrar. Intenta de nuevo.');
        });
}