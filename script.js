let scannerCrearLista;
let scannerActualizarEstatus;
let listaAlumnos = JSON.parse(localStorage.getItem('listaAlumnos')) || [];
const beepSound = document.getElementById('beep');
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

document.getElementById('exportarExcel').addEventListener('click', exportarExcel);
document.getElementById('importarExcel').addEventListener('click', importarExcel);

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
      listaAlumnos.push({ alumno: '', codigo: codigo, estatus: 'Faltante' });
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

    const tdEstatus = document.createElement("td");
    tdEstatus.textContent = record.estatus;

    tr.appendChild(tdAlumno);
    tr.appendChild(tdCodigo);
    tr.appendChild(tdEstatus);
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

    const tdEstatus = document.createElement("td");
    tdEstatus.textContent = record.estatus;

    tr.appendChild(tdAlumno);
    tr.appendChild(tdCodigo);
    tr.appendChild(tdEstatus);
    tbody.appendChild(tr);
  });
}

function exportarExcel() {
  const ws = XLSX.utils.json_to_sheet(listaAlumnos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, new Date().toLocaleDateString());
  XLSX.writeFile(wb, `datos_${new Date().toLocaleDateString()}.xlsx`);
}

function importarExcel() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx';
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);
      listaAlumnos = json;
      localStorage.setItem('listaAlumnos', JSON.stringify(listaAlumnos));
      actualizarTablaVerTabla();
    };
    reader.readAsArrayBuffer(file);
  };
  input.click();
}

function mostrarMensaje(mensaje, tipo) {
  mensajeActualizarEstatus.textContent = mensaje;
  mensajeActualizarEstatus.className = tipo;
  setTimeout(() => {
    mensajeActualizarEstatus.textContent = "";
    mensajeActualizarEstatus.className = "";
  }, 3000);
}