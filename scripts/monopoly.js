document.addEventListener("DOMContentLoaded", function () {

    // Recuperar jugadores guardados en localStorage
    let jugadores = JSON.parse(localStorage.getItem("jugadores")) || [];

    // Guardarlos en una variable global para usarlos en todo el juego
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

                // --- CHANCE y community_chest (fila 2 ---> fila 10, columna 2 --> columna 10)
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
                    casilla.style.gridRow = (10 - i);
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

                // ✅ Ahora sí: agregar el event listener al botón después de crearlo
                document.getElementById("btnDado").addEventListener("click", tirareldado);
            })
            .catch(error => console.error("Error al cargar el tablero:", error));
    });



    // --- FUNCIONES AUXILIARES ---
    function crearCasilla(data) {
        const casillaDiv = document.createElement("div");

        casillaDiv.innerHTML = `
            <div id="${data.id}">
                <div class="casilla-color" style="background-color:${data.color || 'transparent'}"></div>
                <div class="casilla-nombre">${data.name}</div>
                <div class="casilla-precio">${data.price ? `$${data.price}` : ''}</div>
            </div>
        `;

        casillaDiv.classList.add("casilla");

        if (data.color) {
            casillaDiv.classList.add(data.color);
        }
        return casillaDiv;
    }

    // Mostrar fichas en la salida
    function colocarFichas() {
        let jugadores = window.jugadores; // cargados desde localStorage

        jugadores.forEach(jugador => {
            let ficha = document.createElement("div");
            ficha.classList.add("ficha");
            ficha.innerText = jugador.nick; // 1,2,3,4
            ficha.setAttribute("data-id", jugador.id);
            ficha.setAttribute("title", `${jugador.nick} (${jugador.pais}) - $${jugador.score}`);

            // Buscar casilla de salida
            let salida = document.getElementById("0");
            salida.appendChild(ficha);
        });
    }


    let turno = 0; // índice del jugador en turno

    function tirareldado() {
        // Dos dados de 1 a 6
        const dado1 = Math.floor(Math.random() * 6) + 1;
        const dado2 = Math.floor(Math.random() * 6) + 1;
        const numero = dado1 + dado2; // total entre 2 y 12

        const resultado = document.getElementById("resultado");
        let jugador = window.jugadores[turno];

        // Asegurar que el jugador tenga posicion inicial
        if (jugador.posicion === undefined) {
            jugador.posicion = 0;
        }

        // Nueva posición
        jugador.posicion = (jugador.posicion + numero) % 40; // 40 casillas
        localStorage.setItem("jugadores", JSON.stringify(window.jugadores));

        // Mover ficha
        let ficha = document.querySelector(`.ficha[data-id="${jugador.id}"]`);
        let nuevaCasilla = document.getElementById(jugador.posicion);
        nuevaCasilla.appendChild(ficha);

        // Mostrar info en el centro
        resultado.innerHTML = `
        <div class="menu-ficha">
            <h3>🎲 Turno de: ${jugador.nick} (${jugador.pais})</h3>
            <p>Dado 1: ${dado1} 🎲 | Dado 2: ${dado2} 🎲</p>
            <p>Total: <b>${numero}</b></p>
            <p>Casilla actual: ${jugador.posicion}</p>
        </div>
    `;

        // Pasar turno al siguiente jugador
        turno = (turno + 1) % window.jugadores.length;
    }


});
