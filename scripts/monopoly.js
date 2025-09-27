import Player from '../model/player.js';

document.addEventListener("DOMContentLoaded", function () {
    // Recuperar jugadores guardados en localStorage y convertirlos a instancias de Player
    let jugadoresData = JSON.parse(localStorage.getItem("jugadores")) || [];
    
    // Convertir los objetos planos a instancias de Player
    let jugadores = jugadoresData.map(jugadorData => {
        return new Player(
            jugadorData.nickname || jugadorData.nick,
            jugadorData.country || jugadorData.pais,   
            jugadorData.balance || jugadorData.score || 1500, 
            jugadorData.position || jugadorData.posicion || 0, 
            jugadorData.properties || [],
            jugadorData.inJail || false,
            jugadorData.jailTurns || 0
        );
    });

    // Guardarlos en una variable global
    window.jugadores = jugadores;

    console.log("Jugadores disponibles:", window.jugadores);

    let btnCargarCasillas = document.getElementById("btnCargarCasillas");

    btnCargarCasillas.addEventListener("click", function () {
        document.getElementById("btnCargarCasillas").classList.add("d-none");
        let tablero = document.getElementById("tablero");

        fetch("http://127.0.0.1:5000/board")
            .then(response => {
                if (!response.ok) {
                    throw new Error('Fallas en el sistema...');
                }
                return response.json();
            })
            .then(boardData => {
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
                    <button id="btnDado" class="dados">Tirar Dado</button>
                    <div id="resultado"></div>
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTFPiLwxLH8BbOoX_dM4pbj070os1ZH9P3tA&s" class="d-block mx-auto" alt="">
                    <img src="/assets/imgs/interrogacion.png" alt="" class="imagenInterrogacion">
                `;
                tablero.appendChild(centro);
                centro.style.gridRow = "2 / 11";
                centro.style.gridColumn = "2 / 11";

                
                // ---- BOTTOM (fila 11, columnas 11 → 1)
                for (let i = 0; i < casillasBottom.length; i++) {
                    const casilla = crearCasilla(casillasBottom[i]);
                    casilla.style.gridRow = "11";
                    casilla.style.gridColumn = (11 - i);
                    tablero.appendChild(casilla);
                }

                // ---- LEFT (columna 1, filas 10 → 2)
                for (let i = 0; i < casillasLeft.length; i++) {
                    const casilla = crearCasilla(casillasLeft[i]);
                    casilla.style.gridColumn = "1";
                    casilla.style.gridRow = (11 - i);
                    tablero.appendChild(casilla);
                }

                // ---- TOP (fila 1, columnas 2 → 11)
                for (let i = 0; i < casillasTop.length; i++) {
                    const casilla = crearCasilla(casillasTop[i]);
                    casilla.style.gridRow = "1";
                    casilla.style.gridColumn = (i + 2);
                    tablero.appendChild(casilla);
                }

                // ---- RIGHT (columna 11, filas 2 → 10)
                for (let i = 0; i < casillasRight.length; i++) {
                    const casilla = crearCasilla(casillasRight[i]);
                    casilla.style.gridColumn = "11";
                    casilla.style.gridRow = (i + 2);
                    tablero.appendChild(casilla);
                }


                console.log("Se cargaron todas las casillas en los 4 lados.");
                colocarFichas();

                document.getElementById("btnDado").addEventListener("click", tirareldado);
            })
            .catch(error => console.error("Error al cargar el tablero:", error));
    });

    
    function crearCasilla(data) {
    const casillaDiv = document.createElement("div");
    casillaDiv.setAttribute("id", data.id); // id de la casilla

    casillaDiv.innerHTML = `
        <div>
            <div class="casilla-color" style="background-color:${data.color || 'transparent'}"></div>
            <div class="casilla-nombre">${data.name}</div>
            <div class="casilla-precio">${data.price ? `$${data.price}` : ''}</div>
        </div>
    `;

    casillaDiv.classList.add("casilla");
    if (data.color) casillaDiv.classList.add(data.color);

    return casillaDiv;
}

    // Mostrar fichas en la salida
    function colocarFichas() {
        let jugadores = window.jugadores;

        jugadores.forEach(jugador => {
            let ficha = document.createElement("div");
            ficha.classList.add("ficha");
            ficha.innerText = jugador.getNickname().charAt(0).toUpperCase();
            ficha.setAttribute("data-id", jugador.getNickname());
            ficha.setAttribute("title", `${jugador.getNickname()} (${jugador.getCountry()}) - $${jugador.getBalance()}`);
            
           
            let salida = document.getElementById("0");
            if (salida) {
                salida.appendChild(ficha);
            } else {
                console.error("No se encontró la casilla de salida (ID 0)");
            }
        });
    }

    let turno = 0;

    function tirareldado() {
    // Dados
    const dado1 = Math.floor(Math.random() * 6) + 1;
    const dado2 = Math.floor(Math.random() * 6) + 1;
    const numero = dado1 + dado2;

    const resultado = document.getElementById("resultado");
    let jugador = window.jugadores[turno];

    // CALCULAR NUEVA POSICIÓN SEGÚN ID DE LA CASILLA
    let posicionActual = jugador.getPosition();
    let nuevaPosicion = (posicionActual + numero) % 40; // tablero tiene ids 0-39
    jugador.setposition(nuevaPosicion);

    // Guardar estado en localStorage
    localStorage.setItem("jugadores", JSON.stringify(window.jugadores.map(j => ({
        nickname: j.getNickname(),
        country: j.getCountry(),
        balance: j.getBalance(),
        position: j.getPosition(), // Guardamos el id correcto
        properties: j.getProperties(),
        inJail: j.getInJail(),
        jailTurns: j.getJailTurns()
    }))));

    // mover ficha al id con= nuevaPosicion
    let ficha = document.querySelector(`.ficha[data-id="${jugador.getNickname()}"]`);
    let nuevaCasilla = document.getElementById(nuevaPosicion.toString());

        // Mostrar info en el centro
        resultado.innerHTML = `
        <div class="menu-ficha">
            <h3>🎲 Turno de: ${jugador.nick} (${jugador.pais})</h3>
            <p>Dado 1: ${dado1} 🎲 | Dado 2: ${dado2} 🎲</p>
            <p>Total: <b>${numero}</b></p>
            <p>Casilla actual: ${jugador.posicion}</p>
        </div>
        `;
    console.log(`Moviendo ficha a posición: ${nuevaPosicion}, Casilla ID: ${nuevaCasilla ? nuevaCasilla.id : 'no encontrada'}`);

    if (nuevaCasilla && ficha) {
        ficha.remove(); // quitar de la casilla anterior
        nuevaCasilla.appendChild(ficha); // poner en la nueva
    }

    // Mostrar info
    resultado.innerHTML = `
    <div class="menu-ficha">
        <h3>🎲 Turno de: ${jugador.getNickname()} (${jugador.getCountry()})</h3>
        <p>Dado 1: ${dado1} 🎲 | Dado 2: ${dado2} 🎲</p>
        <p>Total: <b>${numero}</b></p>
        <p>Casilla actual: ${jugador.getPosition()}</p>
        <p>Balance: $${jugador.getBalance()}</p>
    </div>
    `;

    // Pasar turno
    turno = (turno + 1) % window.jugadores.length;
}

});