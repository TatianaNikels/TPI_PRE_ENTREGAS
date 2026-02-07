document.addEventListener('DOMContentLoaded', () => {
    const subjectsBody = document.getElementById('subjectsBody');
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    const saveBtn = document.getElementById('saveBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const estudianteSelect = document.getElementById('estudiante');
    const gradoSelect = document.getElementById('grado');

    // --- AUTENTICACIÓN ---
    const dniLog = localStorage.getItem('dni');
    const userType = localStorage.getItem('user_tipo');
    if (!dniLog || userType !== '2') {
        sessionStorage.setItem('sesionCerrada', 'true');
        window.location.href = 'index.html';
        return;
    }

    const allAvailableSubjects = [
        'Matematica', 'Inglés Técnico', 'Marco Juridico y Derechos del Trabajo', 'Asistencia 2',
        'Autogestion', 'Hardware 4', 'Practicas Profesionalizantes', 'Programacion', 'Redes 3'
    ];

    let selectedSubjects = [];

    // --- NUEVA FUNCIÓN: VALIDACIÓN DE 2 DÍGITOS Y RANGO 1-10 ---
    function aplicarValidacionNota(input) {
        input.addEventListener('input', function() {
            // No permite más de 2 caracteres (ej: evita el 100)
            if (this.value.length > 2) {
                this.value = this.value.slice(0, 2);
            }

            let valor = parseInt(this.value);
            
            // Si el número es mayor a 10, lo corrige automáticamente a 10
            if (valor > 10) {
                this.value = "10";
            }
            // Evita números negativos
            if (valor < 0) {
                this.value = "";
            }
        });
    }

    // --- 1. CARGAR ALUMNOS POR CURSO ---
    gradoSelect.addEventListener('change', () => {
        const curso = gradoSelect.value;
        estudianteSelect.innerHTML = '<option value="" disabled selected>Cargando alumnos...</option>';
        subjectsBody.innerHTML = '';
        
        fetch(`http://localhost:3000/api/alumnos/curso/${curso}`)
            .then(res => res.json())
            .then(data => {
                let options = '<option value="" disabled selected>Seleccione Alumno</option>';
                data.forEach(a => {
                    options += `<option value="${a.dni}">${a.nombre_Apellido}</option>`;
                });
                estudianteSelect.innerHTML = options;
            })
            .catch(err => console.error("Error cargando alumnos:", err));
    });

    // --- 2. CARGAR NOTAS EXISTENTES ---
    estudianteSelect.addEventListener('change', () => {
        const dni = estudianteSelect.value;
        const curso = gradoSelect.value;
        if (!dni || !curso) return;

        fetch(`http://localhost:3000/api/notas/${dni}/${curso}`)
            .then(res => res.json())
            .then(data => {
                subjectsBody.innerHTML = '';
                selectedSubjects = [];
                
                data.forEach(m => {
                    selectedSubjects.push(m.materia);
                    const row = document.createElement('tr');
                    const notas = [m.nota_p1_c1, m.nota_p2_c1, m.nota_c1, m.nota_p1_c2, m.nota_p2_c2, m.nota_c2, m.nota_final];

                    let html = `<td><input type="text" class="subject-name-input" value="${m.materia}" readonly></td>`;
                    notas.forEach(n => {
                        const val = (n !== null && n !== undefined && n !== "") ? n : "";
                        const readonly = val !== "" ? "readonly style='background-color: #f0f0f0;'" : "";
                        html += `<td><input type="number" min="1" max="10" class="grade-input" value="${val}" ${readonly}></td>`;
                    });
                    row.innerHTML = html;
                    subjectsBody.appendChild(row);

                    // Aplicamos validación a los inputs que NO son readonly
                    row.querySelectorAll('.grade-input:not([readonly])').forEach(input => {
                        aplicarValidacionNota(input);
                    });
                });
                updateAddSubjectButton();
            });
    });

    // --- 3. AGREGAR NUEVA MATERIA ---
    addSubjectBtn.addEventListener('click', () => {
        const available = allAvailableSubjects.filter(s => !selectedSubjects.includes(s));
        if (available.length === 0) return alert("No hay más materias disponibles.");

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <select class="subject-select">
                    <option value="" disabled selected>Seleccione Materia</option>
                    ${available.map(s => `<option value="${s}">${s}</option>`).join('')}
                </select>
            </td>
            ${'<td><input type="number" min="1" max="10" class="grade-input"></td>'.repeat(7)}
        `;
        subjectsBody.appendChild(row);

        // Aplicamos la validación a los nuevos inputs de esta fila
        row.querySelectorAll('.grade-input').forEach(input => {
            aplicarValidacionNota(input);
        });

        row.querySelector('.subject-select').addEventListener('change', (e) => {
            selectedSubjects.push(e.target.value);
            updateAddSubjectButton();
        });
    });

    function updateAddSubjectButton() {
        addSubjectBtn.style.display = (allAvailableSubjects.length > selectedSubjects.length) ? 'block' : 'none';
    }

    // --- 4. GUARDAR Y BLOQUEAR ---
    saveBtn.addEventListener('click', async () => {
        const informeData = {
            estudiante: estudianteSelect.value,
            docente: localStorage.getItem('nombre') || 'Docente',
            grado: gradoSelect.value,
            materias: []
        };

        const rows = subjectsBody.querySelectorAll('tr');
        let valid = true;

        rows.forEach(row => {
            const select = row.querySelector('.subject-select');
            const inputReadonly = row.querySelector('.subject-name-input');
            const materiaNombre = select ? select.value : (inputReadonly ? inputReadonly.value : '');
            
            if (!materiaNombre) {
                valid = false;
                return;
            }

            const gradeInputs = row.querySelectorAll('.grade-input');
            const notas = Array.from(gradeInputs).map(i => i.value || null);

            informeData.materias.push({
                materia: materiaNombre,
                notas: notas
            });
        });

        if (!valid || informeData.materias.length === 0) {
            return alert("Por favor seleccione las materias para todas las filas.");
        }

        try {
            const res = await fetch('http://localhost:3000/api/informes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(informeData)
            });

            if (res.ok) {
                alert("Notas guardadas exitosamente.");
                document.querySelectorAll('.grade-input').forEach(input => {
                    if (input.value !== "") {
                        input.setAttribute('readonly', 'true');
                        input.style.backgroundColor = '#f0f0f0';
                    }
                });
                estudianteSelect.dispatchEvent(new Event('change'));
            }
        } catch (err) {
            alert("Error al conectar con el servidor.");
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
});