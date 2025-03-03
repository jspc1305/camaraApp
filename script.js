let scanner;
let scannedData = [];      // Array que almacena los registros escaneados
let codigoPendiente = null; // Código detectado pendiente de confirmación
const beepSound = document.getElementById('beep');
const mensajeDiv = document.getElementById('mensaje');
const scannerDiv = document.getElementById('scanner');

// Botón para iniciar el escaneo
document.getElementById('iniciarEscaneo').addEventListener('click', () => {
  scannerDiv.classList.remove('hidden');
  iniciarScanner();
});

// Botón para exportar la lista a CSV
document.getElementById('guardarDatos').addEventListener('click', () => {
  if(scannedData.length > 0) {
    exportarCSV();
  } else {
    mostrarMensaje("No hay datos para guardar.", "error");
  }
});

// Inicia el escáner utilizando la librería html5-qrcode
function iniciarScanner() {
  if (!scanner) {
    scanner = new Html5QrcodeScanner("scanner", { fps: 10, qrbox: 250 });
  }
  scanner.render(processarCodigo);
}

// Callback del escáner: se ejecuta al detectar un código
function processarCodigo(codigo) {
  // Si ya hay un código pendiente de confirmación, ignorar nuevos
  if (codigoPendiente !== null) {
    return;
  }
  // Verificar si el código ya fue registrado
  if (scannedData.some(item => item.codigo === codigo)) {
    mostrarMensaje(`Código ${codigo} ya fue registrado.`, "error");
    return;
  }
  codigoPendiente = codigo;
  mostrarMensaje(`Código detectado: ${codigo}. Toca la cámara para confirmar.`, "success");
}

// Al tocar el área de la cámara se confirma el registro del código pendiente
scannerDiv.addEventListener('touchend', confirmarCodigo);
scannerDiv.addEventListener('click', confirmarCodigo);

function confirmarCodigo() {
  if (codigoPendiente !== null) {
    scannedData.push({ alumno: "", codigo: codigoPendiente, estatus: "Entregado" });
    // Reproduce el sonido de confirmación
    beepSound.play().catch(error => console.log("Error reproduciendo beep:", error));
    mostrarMensaje(`Código ${codigoPendiente} guardado.`, "success");
    codigoPendiente = null;
    actualizarTabla();
  }
}

// Actualiza la tabla que muestra la lista de registros
function actualizarTabla() {
  const tbody = document.querySelector("#tablaDatos tbody");
  tbody.innerHTML = "";
  scannedData.forEach((record, index) => {
    const tr = document.createElement("tr");
    tr.dataset.index = index;
    
    // Celda editable para "Alumno"
    const tdAlumno = document.createElement("td");
    tdAlumno.textContent = record.alumno;
    tdAlumno.setAttribute("contenteditable", "true");
    tdAlumno.addEventListener("blur", function() {
      scannedData[index].alumno = this.textContent;
    });
    
    // Celda para "Código de Barras"
    const tdCodigo = document.createElement("td");
    tdCodigo.textContent = record.codigo;
    
    // Celda para "Estatus"
    const tdEstatus = document.createElement("td");
    tdEstatus.textContent = record.estatus;
    
    // Celda para Acciones (botón eliminar)
    const tdAcciones = document.createElement("td");
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.addEventListener("click", function() {
      scannedData.splice(index, 1);
      actualizarTabla();
      mostrarMensaje("Registro eliminado.", "success");
    });
    tdAcciones.appendChild(btnEliminar);
    
    tr.appendChild(tdAlumno);
    tr.appendChild(tdCodigo);
    tr.appendChild(tdEstatus);
    tr.appendChild(tdAcciones);
    tbody.appendChild(tr);
  });
}

// Exporta los datos a un archivo CSV para su descarga
function exportarCSV() {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Alumno,Código de Barras,Estatus\r\n";
  scannedData.forEach(record => {
    let row = `${record.alumno},${record.codigo},${record.estatus}`;
    csvContent += row + "\r\n";
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "datos_escaneados.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  mostrarMensaje("Datos exportados correctamente.", "success");
}

// Muestra un mensaje temporal en la pantalla (éxito o error)
function mostrarMensaje(mensaje, tipo) {
  mensajeDiv.textContent = mensaje;
  mensajeDiv.className = tipo;
  setTimeout(() => {
    mensajeDiv.textContent = "";
    mensajeDiv.className = "";
  }, 3000);
}
