let personajes = [];  // Array vacío para almacenar personajes de la base de datos
let turnoActual = 0;  // Empezamos con el primer jugador

// Función para obtener los personajes desde el backend
function obtenerPersonajes() {
    console.log("Solicitando personajes desde el backend...");
    fetch('http://127.0.0.1:5000/personajes')  // Solicita la lista de personajes al backend
        .then(response => response.json())
        .then(data => {
            personajes = data;  // Almacena los personajes en la variable
            console.log("Personajes cargados desde el backend:", personajes);
            actualizarInterfaz();  // Llama a la función de actualización después de cargar los personajes
        })
        .catch(error => console.error('Error al cargar personajes:', error));
}

// Función para alternar la visibilidad del menú de enemigos
function toggleEnemigos() {
    const listaEnemigos = document.getElementById('enemigos-lista');
    listaEnemigos.style.display = listaEnemigos.style.display === 'block' ? 'none' : 'block';
}

// Función para agregar un enemigo al array de personajes
function agregarAlaBatalla(enemigo) {
    // Agregar el enemigo al array de personajes
    personajes.push(enemigo);

    // Mostrar los personajes actuales en consola (puedes actualizar la interfaz si es necesario)
    console.log("Personajes en batalla:", personajes);

    // Aquí podrías llamar a una función para actualizar la UI, si quieres mostrar los personajes en algún lugar
    actualizarInterfaz();
}

// Función para cargar los enemigos desde el backend
function cargarEnemigos() {
    console.log("Cargando enemigos...");

    // Hacer la solicitud a la API para obtener los enemigos
    fetch('http://127.0.0.1:5000/enemigos')
        .then(response => response.json())
        .then(data => {
            const contenedorEnemigos = document.getElementById('enemigos-lista');
            contenedorEnemigos.innerHTML = ''; // Limpiar cualquier contenido previo

            if (Array.isArray(data)) {
                data.forEach(enemigo => {
                    const enemigoDiv = document.createElement('div');
                    enemigoDiv.classList.add('enemigo');
                    enemigoDiv.textContent = enemigo.nombre || 'Enemigo sin nombre';

                    // Crear el botón "Agregar a la batalla"
                    const botonAgregar = document.createElement('button');
                    botonAgregar.textContent = 'Agregar a la batalla';
                    botonAgregar.onclick = () => agregarAlaBatalla(enemigo); // Llamada a la función para agregarlo al array de personajes
                    enemigoDiv.appendChild(botonAgregar);

                    // Añadir el div del enemigo al contenedor
                    contenedorEnemigos.appendChild(enemigoDiv);
                });
            } else {
                console.error("La respuesta no contiene una lista válida de enemigos.");
            }
        })
        .catch(error => console.error('Error al cargar enemigos:', error));
}

// Función para actualizar la interfaz
function actualizarInterfaz() {
    console.log(`📢 Actualizando interfaz, turno actual: ${turnoActual}`);
    
    // Si no hay personajes, evitar continuar
    if (personajes.length === 0) {
        console.log("⚠ No hay personajes para actualizar.");
        return;
    }

    // Ordenar personajes antes de mostrar la interfaz
    personajes.sort((a, b) => {
        if (b.iniciativa !== a.iniciativa) {
            return b.iniciativa - a.iniciativa; // Primero ordena por iniciativa
        }
        return b.destreza - a.destreza; // Si hay empate, ordena por destreza
    });
    

    // Limpiar la lista de personajes antes de actualizarla
    const listaPersonajes = document.getElementById('personajes-lista');
    if (!listaPersonajes) {
        console.error("❌ No se encontró el elemento 'personajes-lista' en el DOM.");
        return;
    }

    listaPersonajes.innerHTML = '';  // Limpiar lista actual

    personajes.forEach((personaje, index) => {
        console.log(`🎭 Procesando personaje: ${personaje.nombre}, HP: ${personaje.hp}, Estado: ${personaje.estado}`);

        // Crear un elemento li para cada personaje
        const personajeItem = document.createElement('li');
        personajeItem.classList.add('personaje');
        personajeItem.id = personaje.id;

        // Mostrar información del personaje
        personajeItem.innerHTML = `
           <p>
            ${personaje.nombre} - HP: ${personaje.hp} - Estado: ${personaje.estado} - 
            Iniciativa: <input type="number" class="iniciativaInput" data-id="${personaje.id}" value="${personaje.iniciativa}" min="0" style="width: 50px;">
            </p>

        `;

         // Si el HP del personaje es 0, CAMBIAR COLOR A MUERTOSSSSSS
         if (personaje.hp === 0) {
            personajeItem.style.backgroundColor = 'gray'; // O cualquier color que prefieras
            console.log(`🛑 ${personaje.nombre} ha muerto y su color ha cambiado a gris.`);
        }
        // Si es el turno del personaje, agregar la clase 'turno'
        if (index === turnoActual) {
            console.log(`🔥 Es el turno de ${personaje.nombre}`);
            personajeItem.classList.add('turno');
        }

        // Agregar el personaje a la lista
        listaPersonajes.appendChild(personajeItem);

        // Si es el turno, mostrar las opciones de ataque
        if (index === turnoActual) {
            console.log(`📝 Mostrando carta de ${personaje.nombre}`);
            mostrarCarta(personaje);

            // Asegurarnos de que los botones existen antes de modificarlos
            const atacarBtn = document.getElementById('atacar');
            const curarBtn = document.getElementById('curar');
            const estadoBtn = document.getElementById('estadoAlterado');

            if (atacarBtn && curarBtn && estadoBtn) {
                atacarBtn.style.display = 'inline-block';
                curarBtn.style.display = 'inline-block';
                estadoBtn.style.display = 'inline-block';
            } else {
                console.error("❌ Uno o más botones de acción no fueron encontrados en el DOM.");
            }

            // Ocultar formularios
            document.getElementById('formularioAtaque').style.display = 'none';
            document.getElementById('formularioCurar').style.display = 'none';
            document.getElementById('formularioEstado').style.display = 'none';

            // Cargar opciones para los formularios
            cargarOpciones('objetivo');
            cargarOpciones('curarObjetivo');
            cargarOpciones('estadoObjetivo');
        }
    });

    // Agregar eventos a los inputs de iniciativa
    document.querySelectorAll('.iniciativaInput').forEach(input => {
        input.addEventListener('change', (event) => {
            const personajeId = parseInt(event.target.dataset.id);
            const nuevoValor = parseInt(event.target.value) || 0;

            console.log(`🔄 Cambiando iniciativa de ID ${personajeId} a ${nuevoValor}`);

        // Buscar el personaje y actualizar su iniciativa en el array
        const personaje = personajes.find(p => p.id === personajeId);
        if (personaje) {
            personaje.iniciativa = nuevoValor;

            // Reordenar el array de personajes por iniciativa
            personajes.sort((a, b) => {
                if (b.iniciativa !== a.iniciativa) {
                    return b.iniciativa - a.iniciativa; // Primero ordena por iniciativa
                }
                return b.destreza - a.destreza; // Si hay empate, ordena por destreza
            });
            

            console.log("📋 Nuevo orden de iniciativa:", personajes.map(p => `${p.nombre}: ${p.iniciativa}`).join(", "));

            // Actualizar la interfaz con el nuevo orden
            actualizarInterfaz();
        }
    });
});

    console.log("✅ Interfaz actualizada correctamente.");
}


// ✅ FORZAR LA PRIMERA ACTUALIZACIÓN AL CARGAR LA PÁGINA
window.onload = () => {
    obtenerPersonajes();  // Obtener los personajes desde el backend
    cargarEnemigos();
};

// Función para pasar al siguiente turno
document.getElementById('siguienteTurno').addEventListener('click', () => {
    console.log(`Botón siguiente turno presionado. Turno actual antes de cambiar: ${turnoActual}`);
    
    // Cambiar al siguiente jugador, ciclando
    turnoActual = (turnoActual + 1) % personajes.length;
    console.log(`Turno cambiado: ${turnoActual}`);

    // Llamar a actualizar la interfaz con un pequeño retraso para asegurar que todo se renderice bien
    setTimeout(() => {
        // Primero actualizamos la interfaz (esto puede incluir cambios de estilos, texto, etc.)
        actualizarInterfaz();

        // Obtener el contenedor de personajes
        const contenedorPersonajes = document.getElementById('personajes');
        
        // Obtener todos los personajes y el personaje actual
        const personajesLista = document.querySelectorAll('.personaje');
        const personajeEnTurno = personajesLista[turnoActual]; // Seleccionamos al personaje en turno
        
        // Asegurarnos de que el contenedor de personajes se desplace al personaje en turno
        /*if (personajeEnTurno) {
            // Ajustamos el scrollTop para que el personaje en turno quede en la parte superior
            contenedorPersonajes.scrollTop = personajeEnTurno.offsetTop - contenedorPersonajes.offsetTop;
        }*/
        if (personajeEnTurno) {
            // Desplazamiento suave a la posición del personaje
            smoothScrollToPersonaje(contenedorPersonajes, personajeEnTurno);
        }
           

    }, 150); // 100ms de retraso, ajusta si es necesario
});



// Función para realizar el desplazamiento suave hacia el personaje en turno
function smoothScrollToPersonaje(contenedor, personaje) {
    // Posición inicial
    const start = contenedor.scrollTop;
    // Posición final, el personaje debe quedar en la parte superior del contenedor
    const target = personaje.offsetTop - contenedor.offsetTop;

    // Duración del desplazamiento en milisegundos
    const duration = 250; // 500ms
    let startTime = null;

    // Función que se ejecuta para realizar el desplazamiento suave
    function scrollAnimation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const elapsed = currentTime - startTime;

        // Calcular la cantidad de desplazamiento basada en el tiempo transcurrido
        const scrollAmount = easeInOutQuad(elapsed, start, target - start, duration);

        // Aplicar el desplazamiento
        contenedor.scrollTop = scrollAmount;

        // Continuar la animación mientras no se haya alcanzado la posición final
        if (elapsed < duration) {
            requestAnimationFrame(scrollAnimation);
        } else {
            // Asegurarse de que se llegue exactamente a la posición final
            contenedor.scrollTop = target;
        }
    }

    // Iniciar la animación
    requestAnimationFrame(scrollAnimation);
}

// Función de easing para hacer el desplazamiento más suave (efecto de aceleración/desaceleración)
function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
}

function mostrarCarta(personaje) {
    const carta = document.getElementById('cartaPersonaje');
    carta.style.display = 'block'; // Mostrar la carta

    // Verificar si la URL de la imagen es correcta
    console.log(personaje.imagen_url); // Aquí puedes ver la ruta que se está utilizando

    carta.innerHTML = `
        <div class="cartaBox">
            <div class="imagenContainer">
                <img src="${personaje.imagen_url}" alt="${personaje.nombre}" style="width: 36vw; height: 74vh; border-radius: 10px; border: 2.5px solid #000" />
            </div>
            <div class="texto">
                <h3 class="nombreCarta">${personaje.nombre}</h3>
                <p class="estadoCarta">HP: ${personaje.hp}</p>
                <p class="estadoCarta">Estado: ${personaje.estado}</p>
            </div>
        </div>
    `;
}


// Función para cargar opciones en los selects
function cargarOpciones(selectId) {
    const select = document.getElementById(selectId);
    select.innerHTML = '';

    personajes.forEach((personaje) => {
        const opcion = document.createElement('option');
        opcion.value = personaje.id;
        opcion.textContent = personaje.nombre;
        select.appendChild(opcion);
    });
}

/*---------------------*/
function actualizarVisibilidadFormulario() {
    const formularioAtaque = document.getElementById('formularioAtaque');
    const formularioCurar = document.getElementById('formularioCurar');
    const formularioEstado = document.getElementById('formularioEstado');
    const contenedorFormulario = document.querySelector('.formulario-accion');
    const mensajeAccion = document.getElementById('mensajeAccion');

    // Si se selecciona una acción, muestra el formulario correspondiente
    if (
        formularioAtaque.style.display === 'block' ||
        formularioCurar.style.display === 'block' ||
        formularioEstado.style.display === 'block'
    ) {
        mensajeAccion.style.display = 'none'; // Oculta el mensaje
        contenedorFormulario.style.display = 'flex'; // Muestra el contenedor con el formulario
    } else {
        mensajeAccion.style.display = 'block'; // Muestra el mensaje si no hay acción seleccionada
        contenedorFormulario.style.display = 'none'; // Oculta el contenedor
    }
}

document.getElementById('atacar').addEventListener('click', () => {
    document.getElementById('formularioAtaque').style.display = 'block';
    document.getElementById('formularioCurar').style.display = 'none';
    document.getElementById('formularioEstado').style.display = 'none';
    actualizarVisibilidadFormulario();
});

document.getElementById('curar').addEventListener('click', () => {
    document.getElementById('formularioCurar').style.display = 'block';
    document.getElementById('formularioAtaque').style.display = 'none';
    document.getElementById('formularioEstado').style.display = 'none';
    actualizarVisibilidadFormulario();
});

document.getElementById('estadoAlterado').addEventListener('click', () => {
    document.getElementById('formularioEstado').style.display = 'block';
    document.getElementById('formularioCurar').style.display = 'none';
    document.getElementById('formularioAtaque').style.display = 'none';
    actualizarVisibilidadFormulario();
});



/*----------------------------- */
// Función para manejar el ataque
document.getElementById('confirmarAtaque').addEventListener('click', () => {
    const objetivoId = parseInt(document.getElementById('objetivo').value);
    const daño = parseInt(document.getElementById('daño').value);

    console.log(`⚔ Intentando atacar a ID ${objetivoId} con ${daño} de daño`);

    if (daño > 0) {
        const objetivo = personajes.find(p => p.id === objetivoId);
        if (objetivo) {
            objetivo.hp = Math.max(0, objetivo.hp - daño);  // Evitar HP negativo

            console.log(`✅ ${objetivo.nombre} recibió ${daño} de daño. HP restante: ${objetivo.hp}`);

            mostrarNotificacion(`${objetivo.nombre} ha recibido ${daño} de daño. Le quedan ${objetivo.hp} HP.`);
            mostrarCarta(objetivo);
            // Si el HP es 0, cambiar color o eliminar el personaje
            // Comprobar si el objetivo tiene un elemento asociado antes de intentar cambiar el color
            if (objetivo.elemento) {
                // Si el HP es 0, cambiar el color
                if (objetivo.hp === 0) {
                    objetivo.elemento.style.backgroundColor = 'gray'; // O el color que prefieras
                    console.log(`🛑 ${objetivo.nombre} ha muerto y su color ha cambiado a gris.`);
                }
            } else {
                console.warn("⚠ El personaje no tiene un elemento DOM asociado.");
            }
            // Guardar cambios en el backend
            actualizarInterfaz(objetivo);

            setTimeout(() => {
                turnoActual = (turnoActual + 1) % personajes.length;
                console.log(`🔄 Turno cambiado después del ataque: ${turnoActual}`);
                actualizarInterfaz();
            }, 100);
        } else {
            console.warn("⚠ Personaje no encontrado.");
        }
    } else {
        alert('Por favor, ingresa un valor de daño válido.');
    }
});

// Confirmar curación
document.getElementById('confirmarCuracion').addEventListener('click', () => {
    const objetivoId = parseInt(document.getElementById('curarObjetivo').value);  // Convertir a número
    const cantidadCuracion = parseInt(document.getElementById('cantidadCuracion').value);

    console.log(`🩹 Intentando curar a ID ${objetivoId} con ${cantidadCuracion} HP`);

    // Verificar que la cantidad de curación sea un número válido y positivo
    if (isNaN(cantidadCuracion) || cantidadCuracion <= 0) {
        alert('Por favor, ingresa una cantidad válida de curación.');
        return;
    }

    const objetivo = personajes.find(p => p.id === objetivoId);  // Buscar el personaje por ID
    if (objetivo) {
        const hpMax = objetivo.hp_max;
        const hpActual = objetivo.hp;

        // Verificar que el objetivo tenga valores válidos para HP y HP Max
        if (isNaN(hpMax) || isNaN(hpActual)) {
            console.log(`❌ El personaje tiene valores de HP inválidos: HP Max: ${hpMax}, HP Actual: ${hpActual}`);
            return;
        }

        // Asegurarnos de que tanto hp como hpMax sean números positivos
        if (hpMax <= 0 || hpActual < 0) {
            console.log(`❌ Los valores de HP o HP Max no son válidos: HP Max: ${hpMax}, HP Actual: ${hpActual}`);
            return;
        }

        // Calcular el nuevo HP, asegurándonos de no superar el HP máximo
        const nuevaVida = hpActual + cantidadCuracion;
        objetivo.hp = Math.min(nuevaVida, hpMax);  // Limitar el HP al valor máximo

        console.log(`✅ ${objetivo.nombre} ha sido curado. Nuevo HP: ${objetivo.hp}`);

        // Mostrar notificación sobre la curación
        mostrarNotificacion(`${objetivo.nombre} ha sido curado por ${cantidadCuracion}. Ahora tiene ${objetivo.hp} HP.`);

        // Mostrar la carta del personaje objetivo (se actualiza la interfaz)
        mostrarCarta(objetivo);

        // Ocultar botones de ataque y estado alterado
        document.getElementById('atacar').style.display = 'none';
        document.getElementById('estadoAlterado').style.display = 'none';

        // Actualizar la interfaz de usuario para reflejar los cambios
        actualizarInterfaz();
        
        // Cambiar el turno después de curar
        setTimeout(() => {
            turnoActual = (turnoActual + 1) % personajes.length;
            console.log(`🔄 Turno cambiado después de curar: ${turnoActual}`);
            actualizarInterfaz();  // Refrescar la interfaz después del cambio de turno
        }, 100);
    } else {
        console.log(`❌ No se encontró un personaje con ID ${objetivoId}`);
    }
});

// Confirmar estado alterado
document.getElementById('confirmarEstado').addEventListener('click', () => {
    const objetivoId = parseInt(document.getElementById('estadoObjetivo').value);  // Convertir a número
    const estadoSeleccionado = document.getElementById('estado').value;

    console.log(`⚠ Aplicando estado alterado '${estadoSeleccionado}' a ID ${objetivoId}`);

    const objetivo = personajes.find(p => p.id === objetivoId);
    if (objetivo) {
        objetivo.estado = estadoSeleccionado;  // Aplicar estado
        console.log(`✅ ${objetivo.nombre} ahora tiene el estado: ${estadoSeleccionado}`);

        mostrarNotificacion(`${objetivo.nombre} ha sido afectado por ${estadoSeleccionado}.`);
        mostrarCarta(objetivo);  // Refrescar carta del personaje
        
        // Ocultar botones de ataque y curación
        document.getElementById('atacar').style.display = 'none';
        document.getElementById('curar').style.display = 'none';

        actualizarInterfaz();

        // Cambiar turno después de aplicar el estado alterado
        setTimeout(() => {
            turnoActual = (turnoActual + 1) % personajes.length;
            console.log(`🔄 Turno cambiado después de aplicar estado alterado: ${turnoActual}`);
            actualizarInterfaz();
        }, 100);
    } else {
        console.log(`❌ No se encontró un personaje con ID ${objetivoId}`);
    }
});

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje) {
    const notificacionesDiv = document.getElementById('notificaciones');
    notificacionesDiv.textContent = mensaje;
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notificacionesDiv.textContent = '';
    }, 3000);
}


