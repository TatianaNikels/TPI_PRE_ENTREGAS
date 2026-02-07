/**
 * boletin.js - Página del boletín de notas del alumno
 * Funciones:
 * - Cargar notas desde la API y mostrarlas en tabla
 * - Resaltar filas y columnas interactivamente (efecto "L" invertida)
 * - Calcular promedio final de notas
 */

/**
 * Limpia las clases de resaltado de la tabla.
 */
function limpiarResaltadoTabla() {
    const tabla = document.querySelector('.tabla-notas');
    if (!tabla) return;

    // Remover las clases de fila (antigua y nueva) y columna
    tabla.querySelectorAll('.highlight-row, .highlight-row-segment, .highlight-col').forEach(el => {
        el.classList.remove('highlight-row', 'highlight-row-segment', 'highlight-col');
    });
}

/**
 * Determina el índice de columna de datos (0 a 7) de la tabla basado en la celda tocada.
 * Este índice es el 'absoluto' y es igual al índice en las filas de datos (tbody).
 * @param {HTMLTableCellElement} targetCell - La celda (td o th) tocada.
 * @returns {number} - El índice de columna de datos (0-7). Retorna -1 si no es una celda válida.
 */
function getTargetDataColumnIndex(targetCell) {
    const row = targetCell.closest('tr');
    if (!row) return -1;

    const rowIndex = row.rowIndex;
    const cellIndex = targetCell.cellIndex;

    // Fila 0: th con colspans (Logo(0), C1(1), C2(2), Nota Final(3))
    if (rowIndex === 0) {
        if (cellIndex === 0) return 0; // Logo del colegio -> Columna Materia (Índice 0)
        if (cellIndex === 1) return 1; // Primer Cuatrimestre -> Columna de datos 1 (1° Informe C1)
        if (cellIndex === 2) return 4; // Segundo Cuatrimestre -> Columna de datos 4 (1° Informe C2)
        if (cellIndex === 3) return 7; // Nota Final -> Columna de datos 7
    }
    // Fila 1: th individuales (faltan cols 0 y 7)
    else if (rowIndex === 1) {
        // cellIndex 0-5 se mapean a dataColIndex 1-6
        return cellIndex + 1;
    }
    // Filas de datos (tbody): td individuales (0 a 7). El cellIndex es el dataColIndex.
    else {
        return cellIndex;
    }

    return -1;
}

/**
 * Función auxiliar para resaltar una única columna en todas las filas, manejando colspans.
 * @param {HTMLTableElement} table - La tabla.
 * @param {number} dataColIndex - Índice de la columna de datos (0 a 7) a resaltar.
 */
function highlightSingleColumn(table, dataColIndex) {
    Array.from(table.rows).forEach((r) => {
        const rowIndex = r.rowIndex;
        let cellIndexToHighlight = dataColIndex;

        // 1. Manejo de exclusión para la fila de promedio
        if (r.classList.contains('fila-promedio') && dataColIndex < 7) {
            return; // Evitar resaltar el colspan="7"
        }

        // 2. Ajuste de índice para la Fila 1 (1° informe, 2° informe, etc.)
        if (rowIndex === 1) {
            if (dataColIndex >= 1 && dataColIndex <= 6) {
                cellIndexToHighlight = dataColIndex - 1;
            } else {
                return; // dataColIndex 0 (Materia) o 7 (Nota Final) no existen en Fila 1
            }
        }

        // 3. Ajuste de índice para la Fila 0 (Cuatrimestre)
        else if (rowIndex === 0) {
            if (dataColIndex >= 1 && dataColIndex <= 3) { // Corresponde a "Primer Cuatrimestre"
                cellIndexToHighlight = 1;
            }
            else if (dataColIndex >= 4 && dataColIndex <= 6) { // Corresponde a "Segundo Cuatrimestre"
                cellIndexToHighlight = 2;
            }
            else if (dataColIndex === 7) { // Corresponde a "Nota Final"
                cellIndexToHighlight = 3;
            } else {
                return; // dataColIndex 0 (Logo/Materia)
            }
        }

        // Resaltar la celda con el índice ajustado
        if (r.cells[cellIndexToHighlight]) {
            r.cells[cellIndexToHighlight].classList.add('highlight-col');
        }
    });
}

/**
 * Función auxiliar para resaltar un rango de columnas (útil para los colspans en fila 0).
 */
function highlightColumnRange(table, startColIndex, endColIndex) {
    for (let c = startColIndex; c <= endColIndex; c++) {
        highlightSingleColumn(table, c);
    }
}


/**
 * Maneja el evento mouseover para resaltar la fila y columna en el boletín del alumno.
 * Implementa el efecto de "L" invertida acotada.
 * @param {Event} event
 */
function resaltarCeldaBoletin(event) {
    const targetCell = event.target.closest('td, th');
    const table = document.querySelector('.tabla-notas');

    if (!targetCell || !table) return;

    // 1. Limpiar cualquier resaltado anterior
    limpiarResaltadoTabla();

    const row = targetCell.closest('tr');
    const rowIndex = row.rowIndex;

    // Obtener el índice de la columna de datos (0-7)
    const dataColIndex = getTargetDataColumnIndex(targetCell);

    // --- REGLAS DE EXCLUSIÓN ---
    const isPromedioRow = row.classList.contains('fila-promedio');

    // No resaltar en fila de promedio, o si el índice es inválido.
    if (isPromedioRow || dataColIndex === -1) {
        return;
    }

    // 2. 🚨 RESALTADO DE FILA (SEGMENTADA HASTA LA CELDA DE CRUCE - Efecto "L" invertida acotada)
    // Solo si estamos en una fila de datos de materia (Index 2 en adelante)
    if (rowIndex >= 2) {
        const rowCells = Array.from(row.cells);
        // Iteramos desde la celda de Materia (índice 0) hasta la celda tocada (dataColIndex)
        for (let i = 0; i <= dataColIndex; i++) {
            if (rowCells[i]) {
                rowCells[i].classList.add('highlight-row-segment');
            }
        }
    }


    // 3. RESALTAR COLUMNA (Vertical)

    // Lógica especial para cuando se toca la Fila 0 (Cuatrimestres o Nota Final)
    if (rowIndex === 0) {
        if (dataColIndex === 1) { // Toca "Primer Cuatrimestre"
            highlightColumnRange(table, 1, 3); // Resalta 1°inf, 2°inf, Nota
            return;
        }
        else if (dataColIndex === 4) { // Toca "Segundo Cuatrimestre"
            highlightColumnRange(table, 4, 6); // Resalta 1°inf, 2°inf, Nota
            return;
        }
        else if (dataColIndex === 7) { // Toca "Nota Final"
            highlightSingleColumn(table, 7);
            return;
        }
    }

    // Para Fila 1 y Filas de Datos (tbody):
    // Si se toca la columna de materia (dataColIndex 0), solo se resalta la fila (en el paso 2), no la columna vertical.
    if (dataColIndex > 0) {
        highlightSingleColumn(table, dataColIndex);
    }
}


/**
 * Calcula el promedio final de notas sumando todas las notas_final.
 * @param {Array<Object>} notas - Lista de registros de notas con propiedad nota_final
 * @returns {string|number} - Promedio con 1 decimal, o '--' si no hay notas válidas
 */
function calcularPromedioFinal(notas) {
    let sumaNotas = 0;
    let contadorNotas = 0;

    notas.forEach(nota => {
        const notaFinalStr = nota?.nota_final;
        const notaFinal = parseFloat(notaFinalStr?.replace(',', '.') || 'NaN');

        if (!isNaN(notaFinal) && notaFinal >= 1) {
            sumaNotas += notaFinal;
            contadorNotas++;
        }
    });

    if (contadorNotas === 0) {
        return '--';
    }

    const promedio = sumaNotas / contadorNotas;
    return promedio.toFixed(1);
}


/**
 * Renderiza las notas en la tabla de la página del boletín.
 * Ordena por materias predefinidas y añade fila de promedio.
 * @param {Array<Object>} notas - Array de registros de notas desde la API
 */
function mostrarNotasEnTabla(notas) {
    const tabla = document.querySelector('.tabla-notas tbody');
    if (!tabla) return;

    tabla.innerHTML = '';

    const materiasOrden = [
        'Matemática', 'Inglés Técnico', 'Marco Jurídico y Derechos del Trabajo',
        'Asistencia 2', 'Autogestión', 'Hardware 4',
        'Prácticas Profesionalizantes', 'Programación', 'Redes 3'
    ];

    let htmlContenido = '';

    materiasOrden.forEach(materia => {
        // Buscar la nota coincidente normalizando los nombres (sin tildes, minúsculas)
        const normalize = s => (s || '').toString().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
        const nota = notas.find(n => normalize(n.materia) === normalize(materia));
        htmlContenido += `
            <tr>
                <td>${materia}</td>
                <td>${nota?.nota_p1_c1 || ''}</td>
                <td>${nota?.nota_p2_c1 || ''}</td>
                <td>${nota?.nota_c1 || ''}</td>
                <td>${nota?.nota_p1_c2 || ''}</td>
                <td>${nota?.nota_p2_c2 || ''}</td>
                <td>${nota?.nota_c2 || ''}</td>
                <td>${nota?.nota_final || ''}</td>
            </tr>
        `;
    });

    const promedio = calcularPromedioFinal(notas);

    htmlContenido += `
        <tr class="fila-promedio">
            <td colspan="7" style="text-align: right; font-weight: bold; padding-right: 18px; border-right: none;">
                PROMEDIO FINAL DE NOTAS
            </td>
            <td style="font-weight: bold;">${promedio}</td>
        </tr>
    `;

    tabla.innerHTML = htmlContenido;
}


// ===================================================
// INICIALIZACIÓN - Se ejecuta cuando el DOM está cargado
// ===================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener datos del alumno almacenados en localStorage tras login
    const dni = localStorage.getItem('dni');
    const nombreCompleto = localStorage.getItem('nombre');
    const userType = localStorage.getItem('user_tipo');

    // 2. Validación: solo alumnos (id_tipo = 1) pueden ver boletín
    if (!dni || userType !== '1') {
        console.warn('Acceso no autorizado: No se encontró DNI o user_tipo no es 1.');
    }

    // 3. Actualizar título de bienvenida
    const tituloBienvenida = document.getElementById('nombre-estudiante');
    if (tituloBienvenida && nombreCompleto) {
        tituloBienvenida.textContent = `Bienvenido: ${nombreCompleto.toUpperCase()}`;
    }

    // 4. Cargar notas desde la API
    const dniParaFetch = dni || 'unDNIdePrueba';
    fetch(`http://localhost:3000/api/informes/${dniParaFetch}`)
        .then(response => response.json())
        .then(data => mostrarNotasEnTabla(data))
        .catch(error => {
            console.error('Error al cargar notas:', error);
            mostrarNotasEnTabla([]);
        });

    // 5. Activar resaltado interactivo de celdas
    const tablaNotas = document.querySelector('.tabla-notas');
    if (tablaNotas) {
        tablaNotas.addEventListener('mouseover', resaltarCeldaBoletin);
        tablaNotas.addEventListener('mouseout', limpiarResaltadoTabla);
    }
});