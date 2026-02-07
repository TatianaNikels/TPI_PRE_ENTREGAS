/**
 * index.js - Página principal con carrusel y login
 * Funciones:
 * - Carrusel automático con clonación infinita (loop seamless)
 * - Manejo de redirección por rol de usuario tras login
 */

// ===================================================
// CARRUSEL AUTOMÁTICO
// ===================================================

const carrusel_deslizar = document.querySelector('.carrusel_deslizar');
const images = document.querySelectorAll('.carrusel_deslizar img');
const boton_dc = document.querySelector('.boton_dc');
const boton_iz = document.querySelector('.boton_iz');
const carrusel = document.querySelector('.carrusel');

// Control del carrusel
let counter = 0;
let intervalId = null;
const autoplayDelay = 3000; // ms entre cambios
let totalSlides = 0;
let originalCount = 0;      // Cantidad de imágenes originales
let isResetting = false;    // Flag para detectar reset de posición
let resetToIndex = null;    // Índice al que resetear

/**
 * Obtiene el ancho real de un slide en pixeles.
 * @returns {number} Ancho del contenedor carrusel o primera imagen
 */
function getSlideWidth() {
    return (carrusel && carrusel.getBoundingClientRect().width) ||
        (images[0] && images[0].getBoundingClientRect().width) || 0;
}

/**
 * Clona todas las imágenes al inicio y final para efecto carrusel infinito.
 * Permite transiciones suaves sin parpadeos al "saltar" al inicio.
 */
function cloneImages() {
    const originalImages = Array.from(carrusel_deslizar.querySelectorAll('img:not(.clone)'));

    // Clonar e insertar al final
    originalImages.forEach(img => {
        const clone = img.cloneNode(true);
        clone.classList.add('clone');
        carrusel_deslizar.appendChild(clone);
    });

    // Clonar e insertar al inicio
    originalImages.forEach(img => {
        const clone = img.cloneNode(true);
        clone.classList.add('clone');
        carrusel_deslizar.insertBefore(clone, carrusel_deslizar.firstChild);
    });

    totalSlides = carrusel_deslizar.querySelectorAll('img').length;
    originalCount = originalImages.length;
    counter = originalCount; // Empezar en el primer original (no en los clones iniciales)
}

/**
 * Traslada el carrusel a una posición específica.
 * @param {number} index - Índice de slide al que moverse
 */
function moveTo(index) {
    const size = getSlideWidth();
    if (totalSlides === 0) return;
    carrusel_deslizar.style.transform = 'translateX(' + (-size * index) + 'px)';
    counter = index;
}

/**
 * Avanza al siguiente slide. Detecta si hemos llegado a los clones finales.
 */
function nextSlide() {
    if (totalSlides === 0) return;
    counter++;
    moveTo(counter);

    // Si alcanzamos los clones al final, marcar para resetear
    if (counter >= totalSlides - originalCount) {
        isResetting = true;
        resetToIndex = counter - originalCount;
    }
}

/**
 * Retrocede al slide anterior. Detecta si hemos llegado a los clones iniciales.
 */
function prevSlide() {
    if (totalSlides === 0) return;
    counter--;
    moveTo(counter);

    // Si alcanzamos los clones al inicio, marcar para resetear
    if (counter < originalCount) {
        isResetting = true;
        resetToIndex = counter + originalCount;
    }
}

/**
 * Inicia el autoplay del carrusel (cambio automático cada 3s).
 */
function startAutoplay() {
    stopAutoplay();
    intervalId = setInterval(nextSlide, autoplayDelay);
}

/**
 * Detiene el autoplay del carrusel.
 */
function stopAutoplay() {
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

/**
 * Recalcula y actualiza la posición del carrusel tras un resize.
 */
function updateSizes() {
    const size = getSlideWidth();
    if (size > 0) {
        carrusel_deslizar.style.transform = 'translateX(' + (-size * counter) + 'px)';
    }
}

// ===================================================
// INICIALIZACIÓN DEL CARRUSEL
// ===================================================

window.addEventListener('load', function () {
    cloneImages();
    moveTo(counter);

    // Al finalizar transición: si isResetting es true, saltamos sin animación
    carrusel_deslizar.addEventListener('transitionend', (e) => {
        if (e.propertyName !== 'transform') return;
        if (!isResetting) return;

        // Desactiva transición, salta a índice real, luego restaura transición
        carrusel_deslizar.style.transition = 'none';
        counter = resetToIndex;
        const size = getSlideWidth();
        carrusel_deslizar.style.transform = 'translateX(' + (-size * counter) + 'px)';

        // Restaura transición en el siguiente frame (evita flash)
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                carrusel_deslizar.style.transition = 'transform 0.5s ease-in-out';
            });
        });

        isResetting = false;
        resetToIndex = null;
    });

    // Botón siguiente
    if (boton_dc) {
        boton_dc.addEventListener('click', () => {
            nextSlide();
            startAutoplay();
        });
    }

    // Botón anterior
    if (boton_iz) {
        boton_iz.addEventListener('click', () => {
            prevSlide();
            startAutoplay();
        });
    }

    // Detener autoplay si el mouse está sobre el carrusel, reanudar al salir
    if (carrusel) {
        carrusel.addEventListener('mouseenter', stopAutoplay);
        carrusel.addEventListener('mouseleave', startAutoplay);
    }

    // Actualizar tamaños en caso de cambio de ventana
    window.addEventListener('resize', () => {
        setTimeout(updateSizes, 100);
    });

    updateSizes();
    startAutoplay();
});

// ===================================================
// LOGIN Y REDIRECCIÓN POR ROL
// ===================================================
const loginForm = document.getElementById('loginForm');
const loginUsuario = document.getElementById('loginUsuario');
const loginContrasena = document.getElementById('loginContrasena');
const mensajeError = document.getElementById('mensajeError');

const API_LOGIN_URL = 'http://localhost:3000/api/login';

/**
 * Maneja el envío del formulario de login.
 * - Valida credenciales contra la API
 * - Guarda datos de usuario en localStorage
 * - Redirige según el rol: alumno (pag.4), docente (pag.5), admin (adm.html)
 */
// ===================================================
// LOGIN Y REDIRECCIÓN
// ===================================================
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (mensajeError) mensajeError.textContent = '';

        const usuario = loginUsuario.value.trim();
        const contraseña = loginContrasena.value.trim();

        try {
            const response = await fetch(API_LOGIN_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, contraseña })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('dni', data.dni || '');
                localStorage.setItem('user_tipo', data.id_tipo);
                // Redirección por roles
                if (data.id_tipo == 1) window.location.href = 'pag.4.html';
                else if (data.id_tipo == 2) window.location.href = 'pag.5.html';
                else if (data.id_tipo == 3) window.location.href = 'adm.html';
            } else {
                // AQUÍ: Si falla, mostramos el mensaje y el enlace de recuperación
                if (mensajeError) mensajeError.textContent = "Datos no válidos.";
                document.getElementById('linkOlvide').style.display = 'block'; 
            }
        } catch (error) {
            if (mensajeError) mensajeError.textContent = 'Error de conexión con el servidor.';
        }
    });
}

// ===================================================
// LÓGICA DEL MODAL DE RECUPERACIÓN
// ===================================================
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('recoveryModal');
    const closeBtn = document.getElementById('closeRecovery');
    const linkOlvide = document.getElementById('linkOlvide'); // Referencia correcta
    let usuarioEncontrado = null;

    if(linkOlvide) {
        linkOlvide.onclick = (e) => {
            e.preventDefault();
            modal.style.display = 'block';
        };
    }

    closeBtn.onclick = () => modal.style.display = 'none';

    // Paso 1: Verificar DNI
    document.getElementById('btnCheckDni').onclick = async () => {
        const dni = document.getElementById('recoveryDni').value;
        try {
            const res = await fetch(`http://localhost:3000/api/usuario/verificar/${dni}`);
            if (res.ok) {
                usuarioEncontrado = await res.json();
                // Hint de teléfono: **-****-5521
                const tel = usuarioEncontrado.telefono || "";
                document.getElementById('phoneHint').innerText = `Confirma Teléfono (Termina en: ...${tel.slice(-2)})`;
                document.getElementById('recoveryStep1').style.display = 'none';
                document.getElementById('recoveryStep2').style.display = 'block';
            } else {
                alert("DNI no encontrado en el sistema.");
            }
        } catch (e) { alert("Error al conectar con la API."); }
    };

    // Paso 2: Validar Identidad (DNI, Tel, Curso, Email)
    document.getElementById('btnVerifyIdentity').onclick = () => {
        const tel = document.getElementById('confirmPhone').value.trim();
        const curso = document.getElementById('confirmCurso').value;
        const email = document.getElementById('confirmEmail').value.trim();

        if (tel === usuarioEncontrado.telefono && 
            curso === usuarioEncontrado.curso && 
            email === usuarioEncontrado.correo_Electronico) {
            document.getElementById('recoveryStep2').style.display = 'none';
            document.getElementById('recoveryStep3').style.display = 'block';
        } else {
            alert("Los datos de seguridad no coinciden.");
        }
    };

    // Paso 3: Guardar Nueva Contraseña
    document.getElementById('btnSaveNewPass').onclick = async () => {
        const p1 = document.getElementById('newPass').value;
        const p2 = document.getElementById('newPassConfirm').value;

        if (p1 !== p2) return alert("Las contraseñas no coinciden.");
        if (p1.length < 4) return alert("La contraseña es muy corta.");

        try {
            const res = await fetch('http://localhost:3000/api/usuario/update-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dni: usuarioEncontrado.dni, nuevaPass: p1 })
            });
            if (res.ok) {
                alert("Contraseña actualizada con éxito.");
                window.location.reload();
            }
        } catch (e) { alert("Error al actualizar."); }
    };
});


// ===================================================
// LÓGICA DE MODALES (Recuperación y Padres)
// ===================================================
document.addEventListener('DOMContentLoaded', () => {
    // --- MODAL RECUPERACIÓN ---
    const modalRecovery = document.getElementById('recoveryModal');
    const linkOlvide = document.getElementById('linkOlvide');
    const closeRecovery = document.getElementById('closeRecovery');

    if (linkOlvide) {
        linkOlvide.onclick = (e) => { e.preventDefault(); modalRecovery.style.display = 'block'; };
    }
    if (closeRecovery) {
        closeRecovery.onclick = () => { modalRecovery.style.display = 'none'; };
    }

    // --- MODAL PADRES ---
    const modalPadres = document.getElementById('modalPadres');
    const btnAbrirPadres = document.getElementById('btnAbrirPadres');
    const closePadres = document.getElementById('closePadres');

    if (btnAbrirPadres) {
        btnAbrirPadres.onclick = () => { modalPadres.style.display = 'block'; };
    }
    if (closePadres) {
        closePadres.onclick = () => { modalPadres.style.display = 'none'; };
    }

    // Cerrar modales si se hace clic fuera de ellos
    window.onclick = (event) => {
        if (event.target == modalRecovery) modalRecovery.style.display = "none";
        if (event.target == modalPadres) modalPadres.style.display = "none";
    };
    
    // Acción del botón Consultar (Padres)
    const btnConsultarPadre = document.getElementById('btnConsultarPadre');
    if(btnConsultarPadre){
        btnConsultarPadre.onclick = async () => {
            const dni = document.getElementById('dniAlumnoPadre').value.trim();
            const tel = document.getElementById('telConfirmPadre').value.trim();

            if (!dni || !tel) {
                alert("Por favor completa ambos campos");
                return;
            }

            try {
                const res = await fetch('http://localhost:3000/api/padres/consulta', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dni, tel })
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('dni', dni);
                    localStorage.setItem('nombre', data.nombre); 
                    localStorage.setItem('user_tipo', '1'); 
                    window.location.href = 'pag.4.html';
                } else {
                    alert(data.message || "Datos incorrectos.");
                }
            } catch (e) {
                alert("Error de conexión con el servidor.");
            }
        };
    }
});