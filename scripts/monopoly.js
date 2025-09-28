import Player from "../model/player.js";

document.addEventListener("DOMContentLoaded", function () {
  // Funcion para colores aleatorios
  function generaColor() {
    const hue = Math.floor(Math.random() * 360); // tono aleatorio
    const saturation = Math.floor(Math.random() * 40) + 60; // 60–100%
    const lightness = Math.floor(Math.random() * 20) + 70; // 70–90%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  // Recuperar jugadores guardados en localStorage y convertirlos a instancias de Player
  let jugadoresData = JSON.parse(localStorage.getItem("jugadores")) || [];

  // Convertir los objetos planos a instancias de Player
  let jugadores = jugadoresData.map((jugadorData, index) => {
    return new Player(
      index + 1,
      jugadorData.nickname || jugadorData.nick,
      jugadorData.country || jugadorData.pais,
      jugadorData.balance || jugadorData.score || 1500,
      jugadorData.position || jugadorData.posicion || 0,
      jugadorData.properties || [],
      jugadorData.inJail || false,
      jugadorData.jailTurns || 0,
      jugadorData.background || generaColor()
    );
  });

  // Guardarlos en una variable global
  window.jugadores = jugadores;

  // Variable global para almacenar información del tablero
  window.tableroData = null;

  console.log("Jugadores disponibles:", window.jugadores);

  let btnCargarCasillas = document.getElementById("btnCargarCasillas");

  btnCargarCasillas.addEventListener("click", function () {
    document.getElementById("btnCargarCasillas").classList.add("d-none");
    document.getElementById("abrirMenu").classList.remove("d-none");
    let tablero = document.getElementById("tablero");

    fetch("http://127.0.0.1:5000/board")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Fallas en el sistema...");
        }
        return response.json();
      })
      .then((boardData) => {
        // Guardar datos del tablero globalmente
        window.tableroData = boardData;

        tablero.innerHTML = "";

        const casillasBottom = boardData.bottom;
        const casillasLeft = boardData.left;
        const casillasTop = boardData.top;
        const casillasRight = boardData.right;

        // --- CENTRO ---
        const centro = document.createElement("div");
        centro.classList.add("centro");
        centro.innerHTML = `
                    <img src="/assets/imgs/fortuna.png" alt="" class="imagenFortuna">
                    <div class="d-flex flex-column align-items-center" style="position: absolute; top: 20px; right: 20px; z-index: 50;">
                        <button id="btnDado" class="dados btn btn-secondary mb-2">Tirar Dado</button>
                        <button id="btnTurno" class="siguienteTurno btn btn-warning" disabled>Siguiente Turno</button>
                    </div>
                    <div id="resultado"></div>
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTFPiLwxLH8BbOoX_dM4pbj070os1ZH9P3tA&s" class="d-block mx-auto" alt="" style="max-width: 120px; opacity: 0.3;">
                    <img src="/assets/imgs/interrogacion.png" alt="" class="imagenInterrogacion">
                `;
        tablero.appendChild(centro);
        centro.style.gridRow = "2 / 11";
        centro.style.gridColumn = "2 / 11";

        // ✅ Inicializamos lógica de botones
        const btnDado = document.getElementById("btnDado");
        const btnTurno = document.getElementById("btnTurno");

        btnDado.addEventListener("click", function () {
          tirareldado();
          btnDado.disabled = true;
          btnTurno.disabled = false;
        });

        btnTurno.addEventListener("click", function () {
          // Pasar turno manualmente
          turno = (turno + 1) % window.jugadores.length;
          console.log(
            "Turno del jugador:",
            window.jugadores[turno].getNickname()
          );

          btnTurno.disabled = true;
          btnDado.disabled = false;

          // Actualizar estado de jugadores
          actualizarEstadoJugadores();
        });

        // ---- BOTTOM (fila 11, columnas 11 → 1)
        for (let i = 0; i < casillasBottom.length; i++) {
          const casilla = crearCasilla(casillasBottom[i]);
          casilla.style.gridRow = "11";
          casilla.style.gridColumn = 11 - i;
          tablero.appendChild(casilla);
        }

        // ---- LEFT (columna 1, filas 10 → 2)
        for (let i = 0; i < casillasLeft.length; i++) {
          const casilla = crearCasilla(casillasLeft[i]);
          casilla.style.gridColumn = "1";
          casilla.style.gridRow = 11 - i;
          tablero.appendChild(casilla);
        }

        // ---- TOP (fila 1, columnas 2 → 11)
        for (let i = 0; i < casillasTop.length; i++) {
          const casilla = crearCasilla(casillasTop[i]);
          casilla.style.gridRow = "1";
          casilla.style.gridColumn = i + 2;
          tablero.appendChild(casilla);
        }

        // ---- RIGHT (columna 11, filas 2 → 10)
        for (let i = 0; i < casillasRight.length; i++) {
          const casilla = crearCasilla(casillasRight[i]);
          casilla.style.gridColumn = "11";
          casilla.style.gridRow = i + 2;
          tablero.appendChild(casilla);
        }

        console.log("Se cargaron todas las casillas en los 4 lados.");
        colocarFichas();
        colocarPropiedades();
        actualizarEstadoJugadores(); // Inicializar el estado de jugadores
      })
      .catch((error) => console.error("Error al cargar el tablero:", error));
  });

  function crearCasilla(data) {
    const casillaDiv = document.createElement("div");
    casillaDiv.setAttribute("id", data.id); // id de la casilla

    casillaDiv.innerHTML = `
        <div>
            <div class="casilla-color" style="background-color:${
              data.color || "transparent"
            }"></div>
            <div class="casilla-nombre">${data.name}</div>
            <div class="casilla-precio">${
              data.price ? `$${data.price}` : ""
            }</div>
        </div>
    `;

    casillaDiv.classList.add("casilla");
    if (data.color) casillaDiv.classList.add(data.color);

    return casillaDiv;
  }

  // Mostrar fichas en la salida
  function colocarFichas() {
    let jugadores = window.jugadores;

    jugadores.forEach((jugador) => {
      console.log("jugador:", jugador);
      let ficha = document.createElement("div");
      ficha.classList.add("ficha");
      ficha.innerText = jugador.getNickname().charAt(0).toUpperCase();
      ficha.setAttribute("data-id", jugador.getNickname());
      ficha.setAttribute(
        "title",
        `${jugador.getNickname()} (${jugador.getCountry()}) - $${jugador.getBalance()}`
      );

      // 👇 asignamos el color guardado en el jugador
      ficha.style.backgroundColor = jugador.background;

      // 👇 buscamos la casilla según su posición
      let casilla = document.getElementById(jugador.position);
      if (casilla) {
        casilla.appendChild(ficha);
      } else {
        console.error(`No se encontró la casilla con ID ${jugador.position}`);
      }
    });
  }

  // Función para actualizar tooltips de las fichas
  function actualizarTooltipsFichas() {
    window.jugadores.forEach((jugador) => {
      let ficha = document.querySelector(
        `.ficha[data-id="${jugador.getNickname()}"]`
      );
      if (ficha) {
        ficha.setAttribute(
          "title",
          `${jugador.getNickname()} (${jugador.getCountry()}) - $${jugador.getBalance()}`
        );
      }
    });
  }

  // Función para actualizar el estado de los jugadores en el panel lateral
  function actualizarEstadoJugadores() {
    const listaJugadores = document.getElementById("listaJugadores");
    if (!listaJugadores) return;

    listaJugadores.innerHTML = "";

    window.jugadores.forEach((jugador, index) => {
      const jugadorDiv = document.createElement("div");
      jugadorDiv.className = `card mb-2 ${
        index === turno ? "border-primary" : ""
      }`;
      jugadorDiv.style.backgroundColor = jugador.getBackground();
      jugadorDiv.style.opacity = "0.9";

      jugadorDiv.innerHTML = `
                <div class="card-body p-2">
                    <h6 class="card-title mb-1" style="color: ${
                      index === turno ? "#0066cc" : "#333"
                    };">
                        ${index === turno ? "🎲 " : ""}${jugador.getNickname()}
                    </h6>
                    <p class="card-text small mb-1">
                        💰 $${jugador.getBalance()}<br>
                        🏠 ${jugador.getProperties().length} propiedades<br>
                        📍 Casilla ${jugador.getPosition()}
                    </p>
                </div>
            `;

      listaJugadores.appendChild(jugadorDiv);
    });
  }

  let turno = 0;

  // Función para encontrar el dueño de una propiedad
  function encontrarDuenoPropiedad(casillaId) {
    return window.jugadores.find((jugador) => jugador.tieneProperty(casillaId));
  }

  // Función para obtener información de una casilla del tablero
  function obtenerInfoCasilla(casillaId) {
    const todasLasCasillas = [
      ...window.tableroData.bottom,
      ...window.tableroData.left,
      ...window.tableroData.top,
      ...window.tableroData.right,
    ];
    return todasLasCasillas.find((casilla) => casilla.id === casillaId);
  }

  // Función para calcular la renta base de una propiedad
  function calcularRenta(casillaId, dueno) {
    const infoCasilla = obtenerInfoCasilla(casillaId);

    if (!infoCasilla || infoCasilla.type !== "property") {
      return 0;
    }

    // Por ahora solo usamos la renta base, se puede expandir para incluir casas/hoteles
    return infoCasilla.rent ? infoCasilla.rent.base : 0;
  }

  function colocarPropiedades() {
    let jugadores = window.jugadores;

    jugadores.forEach((jugador) => {
      jugador.getProperties().forEach((propId) => {
        let casilla = document.getElementById(propId);
        if (casilla) {
          let colorBox = casilla.querySelector(".casilla-color");
          if (colorBox) {
            colorBox.style.backgroundColor = jugador.getBackground();
          }
        }
      });
    });
  }

  function tirareldado() {
    // Dados - cambia MODO_PRUEBA a true para usar dados fijos
    const MODO_PRUEBA = true;

    let dado1, dado2;
    if (MODO_PRUEBA) {
      dado1 = 1; // para pruebas
      dado2 = 0; // para pruebas
    } else {
      dado1 = Math.floor(Math.random() * 6) + 1;
      dado2 = Math.floor(Math.random() * 6) + 1;
    }

    const numero = dado1 + dado2;
    console.log(
      "Dados:",
      dado1,
      "+",
      dado2,
      "=",
      numero,
      MODO_PRUEBA ? "(MODO PRUEBA)" : ""
    );

    const resultado = document.getElementById("resultado");
    let jugador = window.jugadores[turno];

    // CALCULAR NUEVA POSICIÓN SEGÚN ID DE LA CASILLA
    let posicionActual = jugador.getPosition();
    let nuevaPosicion = (posicionActual + numero) % 40; // tablero tiene ids 0-39

    console.log(
      "Posición actual:",
      posicionActual,
      "-> Nueva posición:",
      nuevaPosicion,
      "| Movimiento:",
      numero
    );

    jugador.setposition(nuevaPosicion);

    // mover ficha al id con= nuevaPosicion
    let ficha = document.querySelector(
      `.ficha[data-id="${jugador.getNickname()}"]`
    );
    let nuevaCasilla = document.getElementById(nuevaPosicion.toString());

    console.log(
      `Moviendo ficha a posición: ${nuevaPosicion}, Casilla ID: ${
        nuevaCasilla ? nuevaCasilla.id : "no encontrada"
      }`
    );

    if (nuevaCasilla && ficha) {
      ficha.remove(); // quitar de la casilla anterior
      nuevaCasilla.appendChild(ficha); // poner en la nueva
    }

    // *** LÓGICA DE RENTA ***
    // Verificar si la casilla es propiedad de otro jugador
    const duenoCasilla = encontrarDuenoPropiedad(nuevaPosicion);
    let mensajeRenta = "";

    if (duenoCasilla && duenoCasilla.getId() !== jugador.getId()) {
      // El jugador cayó en propiedad ajena, debe pagar renta
      const renta = calcularRenta(nuevaPosicion, duenoCasilla);
      const infoCasilla = obtenerInfoCasilla(nuevaPosicion);

      if (renta > 0) {
        try {
          const resultadoPago = jugador.payRent(renta, duenoCasilla);

          mensajeRenta = `
                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 10px; color: #856404;">
                            <div style="font-weight: bold; margin-bottom: 5px;">💰 Pago de Renta</div>
                            <div style="font-size: 14px;">
                                ${jugador.getNickname()} → ${duenoCasilla.getNickname()}: <strong>$${renta}</strong><br>
                                <small style="color: #666;">Propiedad: ${
                                  infoCasilla.name
                                }</small>
                            </div>
                        </div>
                    `;
        } catch (error) {
          mensajeRenta = `
                        <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 6px; padding: 10px; color: #721c24;">
                            <div style="font-weight: bold; margin-bottom: 5px;">⚠️ Fondos Insuficientes</div>
                            <div style="font-size: 14px;">
                                ${jugador.getNickname()} no puede pagar $${renta}<br>
                                <small style="color: #666;">Propiedad: ${
                                  infoCasilla.name
                                }</small>
                            </div>
                        </div>
                    `;
        }
      }
    }

    // Guardar estado actualizado en localStorage
    localStorage.setItem(
      "jugadores",
      JSON.stringify(
        window.jugadores.map((j) => ({
          nickname: j.getNickname(),
          country: j.getCountry(),
          balance: j.getBalance(),
          position: j.getPosition(),
          properties: j.getProperties(),
          inJail: j.getInJail(),
          jailTurns: j.getJailTurns(),
          background: j.getBackground(),
        }))
      )
    );

    // Actualizar tooltips de las fichas con los nuevos balances
    actualizarTooltipsFichas();

    // Actualizar estado de jugadores en el panel
    actualizarEstadoJugadores();

    // Mostrar info actualizada
    resultado.innerHTML = `
        <div class="menu-ficha" style="background: rgba(255,255,255,0.9); border-radius: 8px; padding: 15px; margin: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); max-width: 300px;">
            <h4 style="margin-bottom: 10px; color: #333;">🎲 Turno: ${jugador.getNickname()}</h4>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>🎲 Dados:</span>
                <span><strong>${dado1} + ${dado2} = ${numero}</strong></span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>📍 Casilla:</span>
                <span><strong>${jugador.getPosition()}</strong></span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>💰 Balance:</span>
                <span><strong>$${jugador.getBalance()}</strong></span>
            </div>
            ${
              mensajeRenta
                ? `<div style="margin-top: 10px;">${mensajeRenta}</div>`
                : ""
            }
        </div>
        `;
  }

  // ------------------ Comprar propiedad ------------------
  document
    .getElementById("btnComprarPropiedad")
    .addEventListener("click", function () {
      let jugador = window.jugadores[turno]; // jugador actual
      let posicion = jugador.getPosition();
      let casilla = document.getElementById(posicion);

      if (!casilla) {
        alert("No se encontró la casilla actual");
        return;
      }

      // verificar si ya es dueño
      if (jugador.tieneProperty(posicion)) {
        alert(`${jugador.getNickname()} ya es dueño de esta propiedad`);
        return;
      }

      // Obtener precio de la casilla
      let precioTexto =
        casilla.querySelector(".casilla-precio")?.innerText || "";
      let precio = parseInt(precioTexto.replace("$", "")) || 0;

      if (precio === 0) {
        alert("Esta casilla no es comprable");
        return;
      }

      try {
        // Usar método buyProperty del Player
        jugador.buyProperty(posicion, precio);

        // Cambiar color de la casilla al color del jugador
        casilla.querySelector(".casilla-color").style.backgroundColor =
          jugador.getBackground();

        // Guardar en localStorage usando PlayertoJSON
        localStorage.setItem(
          "jugadores",
          JSON.stringify(window.jugadores.map((j) => j.PlayertoJSON()))
        );

        alert(
          `${jugador.getNickname()} compró la casilla ${posicion} por $${precio}`
        );

        // Actualizar el estado después de la compra
        actualizarEstadoJugadores();
      } catch (err) {
        alert(err.message); // Ej: "Fondos insuficientes"
      }
    });
});
