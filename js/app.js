// ==========
// Variables
const formulario = document.querySelector("#agregar-gasto");
const gastoListado = document.querySelector("#gastos ul");

// ==========
// Eventos
eventListeners();
function eventListeners() {
	const existeStorage = JSON.parse(localStorage.getItem("presupuestoJSON"));

	document.addEventListener("DOMContentLoaded", () => {
		existeStorage ? presupuestoStorage(existeStorage) : preguntarPresupuesto();
	});
	formulario.addEventListener("submit", agregarGasto);
}

// ==========
// Clases
class Presupuesto {
	constructor(presupuesto, restante, gastos) {
		this.presupuesto = Number(presupuesto);
		this.restante = Number(restante);
		this.gastos = gastos || [];
	}

	nuevoGasto(gasto) {
		this.gastos = [...this.gastos, gasto];
		this.calcularRestante();
	}

	calcularRestante() {
		const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidad, 0);
		this.restante = this.presupuesto - gastado;
		sincronizarStorage();
		console.log(presupuesto);
	}

	eliminarGasto(id) {
		this.gastos = this.gastos.filter((gasto) => gasto.id !== id);
		this.calcularRestante();
	}
}

class InterfazUI {
	insertarPresupuesto(cantidad) {
		// Extraer valor
		const { presupuesto, restante } = cantidad;
		document.querySelector("#total").textContent = presupuesto;
		document.querySelector("#restante").textContent = restante;
	}

	imprimirAlerta(mensaje, tipo) {
		const divMensaje = document.createElement("div");
		divMensaje.textContent = mensaje;
		divMensaje.classList.add("text-center", "alert");

		tipo == "error"
			? divMensaje.classList.add("alert-danger")
			: divMensaje.classList.add("alert-success");

		document.querySelector(".primario").insertBefore(divMensaje, formulario);

		setTimeout(() => {
			divMensaje.remove();
		}, 3000);
	}

	mostrarGastoListado(gastos) {
		this.limpiarGastoListado();

		// iterar los gastos
		gastos.forEach((gasto) => {
			const { cantidad, nombre, id } = gasto;

			const liNuevoGasto = document.createElement("LI");
			liNuevoGasto.className =
				"list-group-item d-flex justify-content-between align-items-center ";
			// liNuevoGasto.setAttribute("data-id", id);
			liNuevoGasto.dataset.id = id;
			liNuevoGasto.innerHTML = `
                ${nombre} <span class="badge badge-primary badge-pill p-2">${cantidad}</span>
            `;

			const btnBorrar = document.createElement("button");
			btnBorrar.classList.add("btn", "btn-danger", "borrar-gasto");
			btnBorrar.textContent = "X";
			btnBorrar.onclick = () => {
				// presupuesto.eliminarGasto(id) =>> Opcion valida, puede agregar complejidad
				eliminarGasto(id);
			};
			liNuevoGasto.appendChild(btnBorrar);

			// Agregar HTML
			gastoListado.appendChild(liNuevoGasto);
		});
	}

	limpiarGastoListado() {
		while (gastoListado.firstChild) {
			gastoListado.removeChild(gastoListado.firstChild);
		}
	}

	actualizarRestante(restante) {
		document.querySelector("#restante").textContent = restante;
	}

	comprobarPresupuesto(presupuestoObj) {
		const { presupuesto, restante } = presupuestoObj;

		const divRestante = document.querySelector(".restante");

		if (presupuesto / 4 >= restante) {
			divRestante.classList.remove("alert-success", "alert-warning");
			divRestante.classList.add("alert-danger");
		} else if (presupuesto / 2 >= restante) {
			divRestante.classList.remove("alert-success", "alert-danger");
			divRestante.classList.add("alert-warning");
		} else {
			divRestante.classList.remove("alert-danger", "alert-warning");
			divRestante.classList.add("alert-success");
		}

		// Si total <= 0
		if (restante <= 0) {
			ui.imprimirAlerta("El presupuesto se ha agotado", "error");
			formulario.querySelector("button[type='submit']").disabled = true;
		}
	}
}

// ==========
// Instancias // Maso => para no tener la instancia afuera, se crea una variable vacia y luego se llama para instanciarla desde adentro de una funcion
let presupuesto;
const ui = new InterfazUI();

// ==========
// Funciones
function presupuestoStorage(existeStorage) {
	const { presupuesto: presupuestoGuardado, restante, gastos } = existeStorage;
	//Instanciar presupuesto
	presupuesto = new Presupuesto(presupuestoGuardado, restante, gastos);
	// Insertar el presupuesto en HTML
	ui.insertarPresupuesto(presupuesto);
	ui.mostrarGastoListado(gastos);
	// hacer el calculo de lo restante
	ui.actualizarRestante(restante);
	ui.comprobarPresupuesto(presupuesto);
}

function preguntarPresupuesto() {
	const presupuestoUsuario = prompt("¿Cuál es tu presupuesto?");
	if (
		presupuestoUsuario === "" ||
		presupuestoUsuario === null ||
		isNaN(presupuestoUsuario) ||
		presupuestoUsuario <= 0
	) {
		window.location.reload();
	}

	const restante = presupuestoUsuario;
	//Presupuesto validado
	//Instanciar presupuesto
	presupuesto = new Presupuesto(presupuestoUsuario, restante);
	// Insertar el presupuesto en HTML
	ui.insertarPresupuesto(presupuesto);
	sincronizarStorage();
}

function agregarGasto(e) {
	e.preventDefault();
	// Leer datos de FORM
	const nombre = document.querySelector("#gasto").value;
	const cantidad = Number(document.querySelector("#cantidad").value);

	//validar
	if (nombre == "" || cantidad === "") {
		ui.imprimirAlerta("Ambos campos son obligatorios", "error");
		return;
	} else if (cantidad <= 0 || isNaN(cantidad)) {
		ui.imprimirAlerta("Cantidad no válida", "error");
		return;
	}

	// objeto del gasto
	const gasto = { nombre, cantidad, id: Date.now() };
	// añadir el nuevo gasto
	presupuesto.nuevoGasto(gasto);
	// mensaje de exito
	ui.imprimirAlerta("Gasto agregado correctamente");

	// render los gastos HTML
	const { gastos, restante } = presupuesto;
	ui.mostrarGastoListado(gastos);
	ui.actualizarRestante(restante);

	ui.comprobarPresupuesto(presupuesto);

	formulario.reset();
}

function eliminarGasto(id) {
	presupuesto.eliminarGasto(id);

	// eliminar HTML
	const { gastos, restante } = presupuesto;
	ui.mostrarGastoListado(gastos);
	ui.actualizarRestante(restante);
	ui.comprobarPresupuesto(presupuesto);
}

function sincronizarStorage() {
	localStorage.setItem("presupuestoJSON", JSON.stringify(presupuesto));
}
