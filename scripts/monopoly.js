import Player from '../model/Player.js';

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
  async function actualizarEstadoJugadores() {
    const listaJugadores = document.getElementById("listaJugadores");
    if (!listaJugadores) return;

    listaJugadores.innerHTML = "";

    // Procesar jugadores de forma asíncrona para obtener las banderas
    for (let index = 0; index < window.jugadores.length; index++) {
      const jugador = window.jugadores[index];

      const jugadorDiv = document.createElement("div");
      jugadorDiv.className = `card mb-3 ${
        index === turno ? "border-primary border-2" : ""
      }`;
      jugadorDiv.style.backgroundColor = jugador.getBackground();
      jugadorDiv.style.opacity = "0.95";

      // Obtener nombres de propiedades
      const propiedadesNombres = jugador.getProperties().map((propId) => {
        const infoCasilla = obtenerInfoCasilla(propId);
        return infoCasilla ? infoCasilla.name : `Casilla ${propId}`;
      });

      // Obtener bandera del país
      const bandera = await obtenerBandera(jugador.getCountry());

      jugadorDiv.innerHTML = `
                <div class="card-body p-3">
                    <div class="d-flex align-items-center mb-2">
                        <img src="${bandera}" alt="bandera" style="width: 24px; height: 16px; margin-right: 8px">
                        <h6 class="card-title mb-0" style="color: ${
                          index === turno ? "#0066cc" : "#333"
                        }; font-weight: bold;">
                            ${
                              index === turno ? "🎲 " : ""
                            }${jugador.getNickname()}
                        </h6>
                    </div>
                    
                    <div class="mb-2">
                        <small style="color: #666;">${jugador.getCountry()}</small>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>💰 Balance:</span>
                        <span style="font-weight: bold;">$${jugador.getBalance()}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>📍 Casilla:</span>
                        <span style="font-weight: bold;">${jugador.getPosition()}</span>
                    </div>
                    
                    <div class="mb-2">
                        <div style="font-weight: bold; margin-bottom: 4px;">🏠 Propiedades (${
                          jugador.getProperties().length
                        }):</div>
                        <div style="max-height: 100px; overflow-y: auto; font-size: 12px;">
                            ${
                              propiedadesNombres.length > 0
                                ? propiedadesNombres
                                    .map((nombre) => `• ${nombre}`)
                                    .join("<br>")
                                : '<em style="color: #999;">Ninguna propiedad</em>'
                            }
                        </div>
                    </div>
                </div>
            `;

      listaJugadores.appendChild(jugadorDiv);
    }
  }

  // Variable global para almacenar la información de países con sus banderas
  window.countriesData = null;

  // Función para cargar los países desde el backend
  async function cargarPaises() {
    if (!window.countriesData) {
      try {
        const response = await fetch("http://127.0.0.1:5000/countries");
        const countries = await response.json();
        window.countriesData = countries;
      } catch (error) {
        console.error("Error cargando países:", error);
        window.countriesData = [];
      }
    }
    return window.countriesData;
  }

  // Función para obtener la bandera del país (URL en PNG)
  async function obtenerBandera(nombrePais) {
    const countries = await cargarPaises();

    // Buscar el país en los datos del backend
    const country = countries.find((countryObj) => {
      const name = Object.values(countryObj)[0];
      return name === nombrePais;
    });

    if (country) {
      // Obtener el código del país (ej: "CO" para Colombia)
      const code = Object.keys(country)[0];
      // Retornar la URL de la bandera en PNG
      return convertirCodigoABanderaImg(code);
    }

    return "https://flagsapi.com/UN/shiny/64.png"; // Bandera por defecto (ONU)
  }

  // Función para convertir código de país a URL de imagen de bandera
  function convertirCodigoABanderaImg(codigo, estilo = "shiny", size = 64) {
    if (!codigo || codigo.length !== 2)
      return "https://flagsapi.com/UN/shiny/64.png";

    return `https://flagsapi.com/${codigo.toUpperCase()}/${estilo}/${size}.png`;
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

    if (!infoCasilla) {
      console.log("No se encontró información de la casilla:", casillaId);
      return 0;
    }

    console.log(
      "Calculando renta para casilla:",
      infoCasilla.name,
      "Tipo:",
      infoCasilla.type
    );

    // Verificar si es un ferrocarril
    if (
      infoCasilla.type === "railroad" ||
      infoCasilla.name.toLowerCase().includes("ferrocarril")
    ) {
      // Contar cuántos ferrocarriles tiene el dueño
      const ferrocarrilesDelDueno = dueno.getProperties().filter((propId) => {
        const propInfo = obtenerInfoCasilla(propId);
        return (
          propInfo &&
          (propInfo.type === "railroad" ||
            propInfo.name.toLowerCase().includes("ferrocarril"))
        );
      }).length;

      console.log(
        "Es un ferrocarril. El dueño tiene",
        ferrocarrilesDelDueno,
        "ferrocarriles"
      );
      console.log("Estructura de rent:", infoCasilla.rent);

      // Usar la estructura de rent del backend: {"1": 25, "2": 50, "3": 100, "4": 200}
      if (
        infoCasilla.rent &&
        infoCasilla.rent[ferrocarrilesDelDueno.toString()]
      ) {
        const renta = infoCasilla.rent[ferrocarrilesDelDueno.toString()];
        console.log("Renta calculada para ferrocarril:", renta);
        return renta;
      }

      // Fallback a renta base si no encuentra la estructura específica
      const rentaFallback = infoCasilla.rent ? infoCasilla.rent.base || 0 : 0;
      console.log("Usando renta fallback para ferrocarril:", rentaFallback);
      return rentaFallback;
    }

    // Para propiedades normales, verificar que sea tipo property
    if (infoCasilla.type === "property") {
      // Usar la renta base
      const renta = infoCasilla.rent ? infoCasilla.rent.base : 0;
      console.log("Renta calculada para propiedad normal:", renta);
      return renta;
    }

    // Si no es ni property ni railroad, no se paga renta
    console.log("La casilla no es rentable (tipo:", infoCasilla.type, ")");
    return 0;
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

          // Información adicional para ferrocarriles
          let infoAdicional = "";
          if (
            infoCasilla.type === "railroad" ||
            infoCasilla.name.toLowerCase().includes("ferrocarril")
          ) {
            const ferrocarrilesDelDueno = duenoCasilla
              .getProperties()
              .filter((propId) => {
                const propInfo = obtenerInfoCasilla(propId);
                return (
                  propInfo &&
                  (propInfo.type === "railroad" ||
                    propInfo.name.toLowerCase().includes("ferrocarril"))
                );
              }).length;

            infoAdicional = `<br><small style="color: #666;">🚂 ${duenoCasilla.getNickname()} tiene ${ferrocarrilesDelDueno} ferrocarril${
              ferrocarrilesDelDueno > 1 ? "es" : ""
            }</small>`;
          }

          mensajeRenta = `
                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 10px; color: #856404;">
                            <div style="font-weight: bold; margin-bottom: 5px;">💰 Pago de Renta</div>
                            <div style="font-size: 14px;">
                                ${jugador.getNickname()} → ${duenoCasilla.getNickname()}: <strong>$${renta}</strong><br>
                                <small style="color: #666;">Propiedad: ${
                                  infoCasilla.name
                                }</small>${infoAdicional}
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
