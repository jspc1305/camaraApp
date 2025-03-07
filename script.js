let scannerCrearLista;
let scannerActualizarEstatus;
let listaAlumnos = JSON.parse(localStorage.getItem('listaAlumnos')) || [];
const beepSound = document.getElementById('beep');
const errorSound = document.getElementById('error');
const mensajeActualizarEstatus = document.getElementById('mensajeActualizarEstatus');

document.getElementById('crearLista').addEventListener('click', () => {
  mostrarSeccion('crearListaSection');
  iniciarScannerCrearLista();
});

document.getElementById('actualizarEstatus').addEventListener('click', () => {
  mostrarSeccion('actualizarEstatusSection');
  iniciarScannerActualizarEstatus();
});

document.getElementById('verTabla').addEventListener('click', () => {
  mostrarSeccion('verTablaSection');
  actualizarTablaVerTabla();
});

document.getElementById('guardarLista').addEventListener('click', () => {
  localStorage.setItem('listaAlumnos', JSON.stringify(listaAlumnos));
  mostrarMensaje('Lista guardada correctamente.', 'success');
});

document.getElementById('exportarPDF').addEventListener('click', exportarPDF);

document.querySelectorAll('.regresarMenu').forEach(button => {
  button.addEventListener('click', () => mostrarSeccion('menuPrincipal'));
});

function mostrarSeccion(seccion) {
  document.querySelectorAll('.container > div').forEach(div => div.classList.add('hidden'));
  document.getElementById(seccion).classList.remove('hidden');
}

function iniciarScannerCrearLista() {
  if (!scannerCrearLista) {
    scannerCrearLista = new Html5QrcodeScanner("scannerCrearLista", { fps: 10, qrbox: 250 });
  }
  scannerCrearLista.render((codigo) => {
    if (!listaAlumnos.some(item => item.codigo === codigo)) {
      listaAlumnos.push({ alumno: '', codigo: codigo, materia: 'Matemáticas', estatus: 'Faltante' });
      actualizarTablaCrearLista();
      beepSound.play().catch(error => console.log("Error reproduciendo beep:", error));
    }
  });
}

function iniciarScannerActualizarEstatus() {
  if (!scannerActualizarEstatus) {
    scannerActualizarEstatus = new Html5QrcodeScanner("scannerActualizarEstatus", { fps: 10, qrbox: 250 });
  }
  scannerActualizarEstatus.render((codigo) => {
    const alumno = listaAlumnos.find(item => item.codigo === codigo);
    if (alumno) {
      alumno.estatus = 'Entregado';
      localStorage.setItem('listaAlumnos', JSON.stringify(listaAlumnos));
      mostrarMensaje(`Estatus actualizado para ${codigo}.`, 'success');
      beepSound.play().catch(error => console.log("Error reproduciendo beep:", error));
    } else {
      mostrarMensaje(`Código ${codigo} no encontrado.`, 'error');
      errorSound.play().catch(error => console.log("Error reproduciendo error:", error));
    }
  });
}

function actualizarTablaCrearLista() {
  const tbody = document.querySelector("#tablaCrearLista tbody");
  tbody.innerHTML = "";
  listaAlumnos.forEach((record, index) => {
    const tr = document.createElement("tr");
    tr.dataset.index = index;

    const tdAlumno = document.createElement("td");
    tdAlumno.textContent = record.alumno;
    tdAlumno.setAttribute("contenteditable", "true");
    tdAlumno.addEventListener("blur", function() {
      listaAlumnos[index].alumno = this.textContent;
    });

    const tdCodigo = document.createElement("td");
    tdCodigo.textContent = record.codigo;

    const tdMateria = document.createElement("td");
    const selectMateria = document.createElement("select");
    const materias = ["Matemáticas", "Español", "Geografía", "Historia"];
    materias.forEach(materia => {
      const option = document.createElement("option");
      option.value = materia;
      option.textContent = materia;
      if (materia === record.materia) {
        option.selected = true;
      }
      selectMateria.appendChild(option);
    });
    selectMateria.addEventListener("change", function() {
      listaAlumnos[index].materia = this.value;
    });
    tdMateria.appendChild(selectMateria);

    const tdEstatus = document.createElement("td");
    tdEstatus.textContent = record.estatus;

    const tdAcciones = document.createElement("td");
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.addEventListener("click", function() {
      listaAlumnos.splice(index, 1);
      actualizarTablaCrearLista();
      mostrarMensaje("Registro eliminado.", "success");
    });
    tdAcciones.appendChild(btnEliminar);

    tr.appendChild(tdAlumno);
    tr.appendChild(tdCodigo);
    tr.appendChild(tdMateria);
    tr.appendChild(tdEstatus);
    tr.appendChild(tdAcciones);
    tbody.appendChild(tr);
  });
}

function actualizarTablaVerTabla() {
  const tbody = document.querySelector("#tablaVerTabla tbody");
  tbody.innerHTML = "";
  listaAlumnos.forEach((record) => {
    const tr = document.createElement("tr");

    const tdAlumno = document.createElement("td");
    tdAlumno.textContent = record.alumno;

    const tdCodigo = document.createElement("td");
    tdCodigo.textContent = record.codigo;

    const tdMateria = document.createElement("td");
    tdMateria.textContent = record.materia;

    const tdEstatus = document.createElement("td");
    tdEstatus.textContent = record.estatus;

    tr.appendChild(tdAlumno);
    tr.appendChild(tdCodigo);
    tr.appendChild(tdMateria);
    tr.appendChild(tdEstatus);
    tbody.appendChild(tr);
  });
}

function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const fecha = new Date().toLocaleDateString();
  doc.text(`Lista de Alumnos - ${fecha}`, 10, 10);
  const headers = [["Alumno", "Código de Barras", "Materia", "Estatus"]];
  const data = listaAlumnos.map(item => [item.alumno, item.codigo, item.materia, item.estatus]);
  doc.autoTable({
    head: headers,
    body: data,
    startY: 20,
  });
  doc.save(`lista_alumnos_${fecha}.pdf`);
}

function mostrarMensaje(mensaje, tipo) {
  mensajeActualizarEstatus.textContent = mensaje;
  mensajeActualizarEstatus.className = tipo;
  setTimeout(() => {
    mensajeActualizarEstatus.textContent = "";
    mensajeActualizarEstatus.className = "";
  }, 3000);
}