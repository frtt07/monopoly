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
      jugadorData.background || generaColor(),
      jugadorData.mortgagedProperties || []
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
          // Pasar  manualmente
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
            <div class="casilla-color" style="background-color:${data.color || "transparent"
      }"></div>
            <div class="casilla-nombre">${data.name}</div>
            <div class="casilla-precio">${data.price ? `$${data.price}` : ""
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
      jugadorDiv.className = `card mb-3 ${index === turno ? "border-primary border-2" : ""
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
                        <h6 class="card-title mb-0" style="color: ${index === turno ? "#0066cc" : "#333"
        }; font-weight: bold;">
                            ${index === turno ? "🎲 " : ""
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
                        <div style="font-weight: bold; margin-bottom: 4px;">🏠 Propiedades (${jugador.getProperties().length
        }):</div>
                        <div style="max-height: 100px; overflow-y: auto; font-size: 12px;">
                            ${propiedadesNombres.length > 0
          ? propiedadesNombres
            .map((nombre, idx) => {
              const propId =
                jugador.getProperties()[idx];
              const esHipotecada =
                jugador.isPropertyMortgaged(propId);
              return esHipotecada
                ? `• ${nombre} <span style="color: red; font-weight: bold;">[HIPOTECADA]</span>`
                : `• ${nombre}`;
            })
            .join("<br>")
          : '<em style="color: #999;">Ninguna propiedad</em>'
        }
                        </div>
                        ${jugador.getMortgagedProperties().length > 0
          ? `<div style="margin-top: 8px; padding: 4px; background-color: rgba(220,53,69,0.1); border-radius: 4px;">
                               <small style="color: #dc3545;">
                                 🚨 Hipotecadas: ${jugador.getMortgagedProperties().length
          }
                               </small>
                             </div>`
          : ""
        }
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
  function encontrarDueñoPropiedad(casillaId) {
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
  function calcularRenta(casillaId, dueño) {
    const infoCasilla = obtenerInfoCasilla(casillaId);

    if (!infoCasilla) {
      console.log("No se encontró información de la casilla:", casillaId);
      return 0;
    }

    // *** VERIFICAR SI LA PROPIEDAD ESTÁ HIPOTECADA ***
    if (dueño.isPropertyMortgaged(casillaId)) {
      console.log("La propiedad está hipotecada, no se cobra renta");
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
      const ferrocarrilesDelDueño = dueño.getProperties().filter((propId) => {
        const propInfo = obtenerInfoCasilla(propId);
        return (
          propInfo &&
          (propInfo.type === "railroad" ||
            propInfo.name.toLowerCase().includes("ferrocarril"))
        );
      }).length;

      console.log(
        "Es un ferrocarril. El dueño tiene",
        ferrocarrilesDelDueño,
        "ferrocarriles"
      );
      console.log("Estructura de rent:", infoCasilla.rent);

      // Usar la estructura de rent del backend: {"1": 25, "2": 50, "3": 100, "4": 200}
      if (
        infoCasilla.rent &&
        infoCasilla.rent[ferrocarrilesDelDueño.toString()]
      ) {
        const renta = infoCasilla.rent[ferrocarrilesDelDueño.toString()];
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

            // *** MOSTRAR INDICADOR DE HIPOTECA ***
            if (jugador.isPropertyMortgaged(propId)) {
              colorBox.style.border = "3px solid red";
              colorBox.style.opacity = "0.5";
            } else {
              colorBox.style.border = "";
              colorBox.style.opacity = "1";
            }
          }
        }
      });
    });
  }

  // Función para obtener una carta aleatoria de Chance
  function obtenerCartaChance() {
    if (!window.tableroData || !window.tableroData.chance) {
      console.error(
        "No se encontraron cartas de Chance en los datos del tablero"
      );
      return null;
    }

    const cartas = window.tableroData.chance;
    const indiceAleatorio = Math.floor(Math.random() * cartas.length);
    return cartas[indiceAleatorio];
  }

  function obtenerCartaCommunityChest() {
    if (!window.tableroData || !window.tableroData.community_chest) {
      console.error(
        "No se encontraron cartas de Community Chest en los datos del tablero"
      );
      return null;
    }

    const cartas = window.tableroData.community_chest;
    const indiceAleatorio = Math.floor(Math.random() * cartas.length);
    return cartas[indiceAleatorio];
  }

  function procesarCartaChance(jugador, carta) {
    if (!carta || !carta.action) return "";

    let mensaje = "";

    if (carta.action.money) {
      const cantidad = carta.action.money;
      const balanceActual = jugador.getBalance(); // Obtener balance actual

      if (cantidad > 0) {
        const nuevoBalance = balanceActual + cantidad;
        jugador.setBalance(nuevoBalance); // Establecer nuevo balance
        mensaje = `
                <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px; padding: 10px; color: #155724;">
                    <div style="font-weight: bold; margin-bottom: 5px;">🎲 Carta de Sorpresa</div>
                    <div style="font-size: 14px;">
                        ${carta.description}<br>
                        <strong style="color: #28a745;">+$${Math.abs(
          cantidad
        )}</strong><br>
                        <small>Balance anterior: $${balanceActual} → Nuevo balance: $${nuevoBalance}</small>
                    </div>
                </div>
            `;
      } else {
        try {
          const nuevoBalance = balanceActual + cantidad;
          if (nuevoBalance >= 0) {
            jugador.setBalance(nuevoBalance);
            mensaje = `
                        <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 6px; padding: 10px; color: #721c24;">
                            <div style="font-weight: bold; margin-bottom: 5px;">🎲 Carta de Sorpresa</div>
                            <div style="font-size: 14px;">
                                ${carta.description}<br>
                                <strong style="color: #dc3545;">-$${Math.abs(
              cantidad
            )}</strong><br>
                                <small>Balance anterior: $${balanceActual} → Nuevo balance: $${nuevoBalance}</small>
                            </div>
                        </div>
                    `;
          } else {
            throw new Error("Fondos insuficientes");
          }
        } catch (error) {
          mensaje = `
                    <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 6px; padding: 10px; color: #721c24;">
                        <div style="font-weight: bold; margin-bottom: 5px;">🎲 Carta de Sorpresa</div>
                        <div style="font-size: 14px;">
                            ${carta.description}<br>
                            <strong style="color: #dc3545;">No tienes suficiente dinero para pagar!</strong><br>
                            <small>Balance actual: $${balanceActual}</small>
                        </div>
                    </div>
                `;
        }
      }
    }

    return mensaje;
  }

  // Función para procesar una carta de Community Chest
  function procesarCartaCommunityChest(jugador, carta) {
    if (!carta || !carta.action) return "";

    let mensaje = "";

    if (carta.action.money) {
      const cantidad = carta.action.money;
      const balanceActual = jugador.getBalance(); // Obtener balance actual

      if (cantidad > 0) {
        const nuevoBalance = balanceActual + cantidad;
        jugador.setBalance(nuevoBalance); // Establecer nuevo balance
        mensaje = `
                <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 6px; padding: 10px; color: #0c5460;">
                    <div style="font-weight: bold; margin-bottom: 5px;">🏦 Caja de Comunidad</div>
                    <div style="font-size: 14px;">
                        ${carta.description}<br>
                        <strong style="color: #17a2b8;">+$${Math.abs(
          cantidad
        )}</strong><br>
                        <small>Balance anterior: $${balanceActual} → Nuevo balance: $${nuevoBalance}</small>
                    </div>
                </div>
            `;
      } else {
        try {
          const nuevoBalance = balanceActual + cantidad; // cantidad es negativa
          if (nuevoBalance >= 0) {
            jugador.setBalance(nuevoBalance);
            mensaje = `
                        <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 6px; padding: 10px; color: #721c24;">
                            <div style="font-weight: bold; margin-bottom: 5px;">🏦 Caja de Comunidad</div>
                            <div style="font-size: 14px;">
                                ${carta.description}<br>
                                <strong style="color: #dc3545;">-$${Math.abs(
              cantidad
            )}</strong><br>
                                <small>Balance anterior: $${balanceActual} → Nuevo balance: $${nuevoBalance}</small>
                            </div>
                        </div>
                    `;
          } else {
            throw new Error("Fondos insuficientes");
          }
        } catch (error) {
          mensaje = `
                    <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 6px; padding: 10px; color: #721c24;">
                        <div style="font-weight: bold; margin-bottom: 5px;">🏦 Caja de Comunidad</div>
                        <div style="font-size: 14px;">
                            ${carta.description}<br>
                            <strong style="color: #dc3545;">No tienes suficiente dinero para pagar!</strong><br>
                            <small>Balance actual: $${balanceActual}</small>
                        </div>
                    </div>
                `;
        }
      }
    }

    return mensaje;
  }

  // Función para verificar y procesar casillas especiales
  function verificarCasillaEspecial(jugador, casillaId) {
    const infoCasilla = obtenerInfoCasilla(casillaId);
    if (!infoCasilla) return "";

    let mensajeEspecial = "";

    switch (infoCasilla.type) {
      case "chance":
        const cartaChance = obtenerCartaChance();
        if (cartaChance) {
          mensajeEspecial = procesarCartaChance(jugador, cartaChance);
        }
        break;

      case "community_chest":
        const cartaCommunity = obtenerCartaCommunityChest();
        if (cartaCommunity) {
          mensajeEspecial = procesarCartaCommunityChest(
            jugador,
            cartaCommunity
          );
        }
        break;

      case "tax":
        if (infoCasilla.action && infoCasilla.action.money) {
          const impuesto = Math.abs(infoCasilla.action.money);
          const balanceActual = jugador.getBalance();
          try {
            const nuevoBalance = balanceActual - impuesto;
            if (nuevoBalance >= 0) {
              jugador.setBalance(nuevoBalance);
              mensajeEspecial = `
                            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 10px; color: #856404;">
                                <div style="font-weight: bold; margin-bottom: 5px;">💰 Impuesto</div>
                                <div style="font-size: 14px;">
                                    ${infoCasilla.name}<br>
                                    <strong style="color: #856404;">-$${impuesto}</strong><br>
                                    <small>Balance anterior: $${balanceActual} → Nuevo balance: $${nuevoBalance}</small>
                                </div>
                            </div>
                        `;
            } else {
              throw new Error("Fondos insuficientes");
            }
          } catch (error) {
            mensajeEspecial = `
                        <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 6px; padding: 10px; color: #721c24;">
                            <div style="font-weight: bold; margin-bottom: 5px;">💰 Impuesto</div>
                            <div style="font-size: 14px;">
                                ${infoCasilla.name}<br>
                                <strong style="color: #dc3545;">No tienes suficiente dinero para pagar el impuesto!</strong><br>
                                <small>Balance actual: $${balanceActual}</small>
                            </div>
                        </div>
                    `;
          }
        }
        break;

      case "special":
        if (infoCasilla.action) {
          if (infoCasilla.action.money && infoCasilla.action.money > 0) {
          } else if (infoCasilla.action.goTo === "jail") {
            // Ir a la cárcel
            jugador.setposition(10); // ID de la cárcel
            jugador.setInJail(true);
            jugador.setJailTurns(3);

            // Mover ficha a la cárcel
            let ficha = document.querySelector(
              `.ficha[data-id="${jugador.getNickname()}"]`
            );
            let casillaCarcel = document.getElementById("10");
            if (ficha && casillaCarcel) {
              ficha.remove();
              casillaCarcel.appendChild(ficha);
            }
          }
        }
        break;
    }

    return mensajeEspecial;
  }

  function tirareldado() {
    // Dados - cambia MODO_PRUEBA a true para usar dados fijos
    const MODO_PRUEBA = false;

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

    // *** LÓGICA PARA DETECTAR SI PASA POR LA SALIDA ***
    let mensajeSalida = "";
    if (posicionActual + numero >= 40) {
      // El jugador pasó por la salida
      const balanceActual = jugador.getBalance();
      const nuevoBalance = balanceActual + 200;
      jugador.setBalance(nuevoBalance);

      mensajeSalida = `
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px; padding: 10px; color: #155724; margin-bottom: 10px;">
                <div style="font-weight: bold; margin-bottom: 5px;">🎉 ¡Pasaste por la Salida!</div>
                <div style="font-size: 14px;">
                    Recibes $200 por pasar por la salida<br>
                    <small>Balance anterior: $${balanceActual} → Nuevo balance: $${nuevoBalance}</small>
                </div>
            </div>
        `;

      console.log(`${jugador.getNickname()} pasó por la salida y recibió $200`);
    }

    jugador.setposition(nuevaPosicion);

    // mover ficha al id con= nuevaPosicion
    let ficha = document.querySelector(
      `.ficha[data-id="${jugador.getNickname()}"]`
    );
    let nuevaCasilla = document.getElementById(nuevaPosicion.toString());

    console.log(
      `Moviendo ficha a posición: ${nuevaPosicion}, Casilla ID: ${nuevaCasilla ? nuevaCasilla.id : "no encontrada"
      }`
    );

    if (nuevaCasilla && ficha) {
      ficha.remove(); // quitar de la casilla anterior
      nuevaCasilla.appendChild(ficha); // poner en la nueva
    }

    // *** LÓGICA DE RENTA ***
    // Verificar si la casilla es propiedad de otro jugador
    const dueñoCasilla = encontrarDueñoPropiedad(nuevaPosicion);
    let mensajeRenta = "";

    if (dueñoCasilla && dueñoCasilla.getId() !== jugador.getId()) {
      // El jugador cayó en propiedad ajena, debe pagar renta
      const renta = calcularRenta(nuevaPosicion, dueñoCasilla);
      const infoCasilla = obtenerInfoCasilla(nuevaPosicion);

      if (renta > 0) {
        try {
          const resultadoPago = jugador.payRent(renta, dueñoCasilla);

          // Información adicional para ferrocarriles
          let infoAdicional = "";
          if (
            infoCasilla.type === "railroad" ||
            infoCasilla.name.toLowerCase().includes("ferrocarril")
          ) {
            const ferrocarrilesDelDueño = dueñoCasilla
              .getProperties()
              .filter((propId) => {
                const propInfo = obtenerInfoCasilla(propId);
                return (
                  propInfo &&
                  (propInfo.type === "railroad" ||
                    propInfo.name.toLowerCase().includes("ferrocarril"))
                );
              }).length;

            infoAdicional = `<br><small style="color: #666;">🚂 ${dueñoCasilla.getNickname()} tiene ${ferrocarrilesDelDueño} ferrocarril${ferrocarrilesDelDueño > 1 ? "es" : ""
              }</small>`;
          }

          mensajeRenta = `
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 10px; color: #856404;">
                        <div style="font-weight: bold; margin-bottom: 5px;">💰 Pago de Renta</div>
                        <div style="font-size: 14px;">
                            ${jugador.getNickname()} → ${dueñoCasilla.getNickname()}: <strong>$${renta}</strong><br>
                            <small style="color: #666;">Propiedad: ${infoCasilla.name
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
                            <small style="color: #666;">Propiedad: ${infoCasilla.name
            }</small>
                        </div>
                    </div>
                `;
        }
      }
    }

    // *** LÓGICA DE CASILLAS ESPECIALES ***
    let mensajeEspecial = verificarCasillaEspecial(jugador, nuevaPosicion);

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
            ${mensajeSalida
        ? `<div style="margin-top: 10px;">${mensajeSalida}</div>`
        : ""
      }
            ${mensajeRenta
        ? `<div style="margin-top: 10px;">${mensajeRenta}</div>`
        : ""
      }
            ${mensajeEspecial
        ? `<div style="margin-top: 10px;">${mensajeEspecial}</div>`
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

  // ------------------ Hipotecar Propiedad ------------------
  document
    .getElementById("btnHipotecar")
    .addEventListener("click", function () {
      let jugador = window.jugadores[turno]; // jugador actual

      // Obtener propiedades no hipotecadas del jugador
      let propiedadesNoHipotecadas = jugador.getUnmortgagedProperties();

      if (propiedadesNoHipotecadas.length === 0) {
        alert("No tienes propiedades disponibles para hipotecar");
        return;
      }

      // Crear lista de opciones
      let opciones = "Selecciona una propiedad para hipotecar:\n\n";
      propiedadesNoHipotecadas.forEach((propId, index) => {
        let propiedad = encontrarPropiedadEnTablero(propId);
        if (propiedad) {
          opciones += `${index + 1}. ${propiedad.name} (Hipoteca: $${propiedad.mortgage || 0
            })\n`;
        }
      });

      let seleccion = prompt(opciones + "\nIngresa el número de la propiedad:");

      if (seleccion === null) return; // Cancelado

      let indice = parseInt(seleccion) - 1;

      if (
        isNaN(indice) ||
        indice < 0 ||
        indice >= propiedadesNoHipotecadas.length
      ) {
        alert("Selección inválida");
        return;
      }

      let propiedadId = propiedadesNoHipotecadas[indice];
      let propiedad = encontrarPropiedadEnTablero(propiedadId);

      if (!propiedad || !propiedad.mortgage) {
        alert("Esta propiedad no se puede hipotecar");
        return;
      }

      try {
        // Hipotecar la propiedad
        jugador.mortgageProperty(propiedadId, propiedad.mortgage);

        // Cambiar visual de la casilla (agregar indicador de hipoteca)
        let casilla = document.getElementById(propiedadId);
        if (casilla) {
          let colorBox = casilla.querySelector(".casilla-color");
          if (colorBox) {
            colorBox.style.border = "3px solid red";
            colorBox.style.opacity = "0.5";
          }
        }

        // Guardar en localStorage
        localStorage.setItem(
          "jugadores",
          JSON.stringify(window.jugadores.map((j) => j.PlayertoJSON()))
        );

        alert(
          `${jugador.getNickname()} hipotecó ${propiedad.name} y recibió $${propiedad.mortgage
          }`
        );

        // Actualizar estado de jugadores
        actualizarEstadoJugadores();
      } catch (err) {
        alert(err.message);
      }
    });

  // ------------------ Deshipotecar Propiedad ------------------
  document
    .getElementById("btnDeshipotecar")
    .addEventListener("click", function () {
      let jugador = window.jugadores[turno]; // jugador actual

      // Obtener propiedades hipotecadas del jugador
      let propiedadesHipotecadas = jugador.getMortgagedProperties();

      if (propiedadesHipotecadas.length === 0) {
        alert("No tienes propiedades hipotecadas");
        return;
      }

      // Crear lista de opciones
      let opciones = "Selecciona una propiedad para deshipotecar:\n\n";
      propiedadesHipotecadas.forEach((propId, index) => {
        let propiedad = encontrarPropiedadEnTablero(propId);
        if (propiedad) {
          let costoTotal = Math.ceil(propiedad.mortgage * 1.1);
          opciones += `${index + 1}. ${propiedad.name
            } (Costo: $${costoTotal} - Hipoteca + 10% interés)\n`;
        }
      });

      let seleccion = prompt(opciones + "\nIngresa el número de la propiedad:");

      if (seleccion === null) return; // Cancelado

      let indice = parseInt(seleccion) - 1;

      if (
        isNaN(indice) ||
        indice < 0 ||
        indice >= propiedadesHipotecadas.length
      ) {
        alert("Selección inválida");
        return;
      }

      let propiedadId = propiedadesHipotecadas[indice];
      let propiedad = encontrarPropiedadEnTablero(propiedadId);

      if (!propiedad || !propiedad.mortgage) {
        alert("Error al encontrar la propiedad");
        return;
      }

      let costoTotal = Math.ceil(propiedad.mortgage * 1.1);

      if (
        !confirm(
          `¿Estás seguro de deshipotecar ${propiedad.name} por $${costoTotal}?`
        )
      ) {
        return;
      }

      try {
        // Deshipotecar la propiedad
        jugador.unmortgageProperty(propiedadId, propiedad.mortgage);

        // Restaurar visual de la casilla
        let casilla = document.getElementById(propiedadId);
        if (casilla) {
          let colorBox = casilla.querySelector(".casilla-color");
          if (colorBox) {
            colorBox.style.border = "";
            colorBox.style.opacity = "1";
            colorBox.style.backgroundColor = jugador.getBackground();
          }
        }

        // Guardar en localStorage
        localStorage.setItem(
          "jugadores",
          JSON.stringify(window.jugadores.map((j) => j.PlayertoJSON()))
        );

        alert(
          `${jugador.getNickname()} deshipotecó ${propiedad.name
          } pagando $${costoTotal}`
        );

        // Actualizar estado de jugadores
        actualizarEstadoJugadores();
      } catch (err) {
        alert(err.message);
      }
    });

  // ------------------ Finalizar Juego ------------------
  document
    .getElementById("btnFinalizarJuego")
    .addEventListener("click", async function () {
      if (confirm("¿Estás seguro de que quieres finalizar el juego?")) {
        await finalizarJuego();
      }
    });

  // Función para finalizar el juego
  async function finalizarJuego() {
    if (!window.jugadores || window.jugadores.length === 0) {
      alert("No hay jugadores en el juego");
      return;
    }

    // Calcular patrimonio de cada jugador
    let jugadoresConPatrimonio = window.jugadores.map((jugador) => {
      let patrimonio = calcularPatrimonio(jugador);
      return {
        jugador: jugador,
        patrimonio: patrimonio,
        detalles: obtenerDetallesPatrimonio(jugador, patrimonio),
      };
    });

    // Ordenar por patrimonio descendente
    jugadoresConPatrimonio.sort((a, b) => b.patrimonio - a.patrimonio);

    // PRIMERO enviar puntuaciones al backend y ESPERAR a que terminen
    await enviarPuntuacionesAlBackend(jugadoresConPatrimonio);

    // DESPUÉS mostrar resultados (que ahora redirige)
    mostrarResultadosFinales(jugadoresConPatrimonio);
  }

  // Función para calcular el patrimonio total de un jugador
  function calcularPatrimonio(jugador) {
    let patrimonio = jugador.getBalance(); // Dinero disponible

    // Sumar valor de propiedades NO HIPOTECADAS
    jugador.getProperties().forEach((propId) => {
      if (window.tableroData) {
        let propiedad = encontrarPropiedadEnTablero(propId);
        if (propiedad && propiedad.price) {
          // *** SOLO CONTAR PROPIEDADES NO HIPOTECADAS ***
          if (!jugador.isPropertyMortgaged(propId)) {
            patrimonio += propiedad.price;

            // TODO: Aquí se debería añadir el valor de casas (100) y hoteles (200)
            // Por ahora no tenemos implementado el sistema de casas/hoteles
          }
        }
      }
    });

    return patrimonio;
  }

  // Función auxiliar para encontrar una propiedad en los datos del tablero
  function encontrarPropiedadEnTablero(propId) {
    if (!window.tableroData) return null;

    let todasLasCasillas = [
      ...window.tableroData.bottom,
      ...window.tableroData.left,
      ...window.tableroData.top,
      ...window.tableroData.right,
    ];

    return todasLasCasillas.find((casilla) => casilla.id === propId);
  }

  // Función para obtener detalles del patrimonio
  function obtenerDetallesPatrimonio(jugador, patrimonioTotal) {
    let dinero = jugador.getBalance();
    let valorPropiedades = patrimonioTotal - dinero;

    return {
      dinero: dinero,
      valorPropiedades: valorPropiedades,
      numPropiedades: jugador.getProperties().length,
    };
  }

  // Función para mostrar los resultados finales
  function mostrarResultadosFinales(jugadoresConPatrimonio) {
    // Redireccionar directamente a la página de ranking
    window.location.href = "/views/ranking.html";
  }

  // Función para enviar puntuaciones al backend
  async function enviarPuntuacionesAlBackend(jugadoresConPatrimonio) {
    for (let item of jugadoresConPatrimonio) {
      let jugador = item.jugador;

      // Obtener el código del país basado en el nombre
      let countryCode = await obtenerCodigoPais(jugador.getCountry());

      let puntuacion = {
        nick_name: jugador.getNickname(),
        score: item.patrimonio,
        country_code: countryCode,
      };

      try {
        let response = await fetch("http://127.0.0.1:5000/score-recorder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(puntuacion),
        });

        if (response.ok) {
          console.log(
            `Puntuación enviada para ${jugador.getNickname()}:`,
            puntuacion
          );
        } else {
          console.error(
            `Error enviando puntuación para ${jugador.getNickname()}:`,
            response.status
          );
        }
      } catch (error) {
        console.error(
          `Error de red enviando puntuación para ${jugador.getNickname()}:`,
          error
        );
      }
    }
  }

  // Función auxiliar para obtener el código del país basado en el nombre
  async function obtenerCodigoPais(nombrePais) {
    try {
      const countries = await cargarPaises();

      // Buscar el país por nombre
      const country = countries.find((countryObj) => {
        const name = Object.values(countryObj)[0];
        return name === nombrePais;
      });

      if (country) {
        // Retornar el código (la clave del objeto)
        return Object.keys(country)[0];
      }

      // Si no se encuentra, retornar un código por defecto
      console.warn(`No se encontró código para el país: ${nombrePais}`);
      return "co"; // Colombia por defecto
    } catch (error) {
      console.error("Error obteniendo código de país:", error);
      return "co"; // Colombia por defecto
    }
  }
});