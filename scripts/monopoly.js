document.addEventListener("DOMContentLoaded", function () {
    let btnCargarCasillas = document.getElementById("btnCargarCasillas");

    btnCargarCasillas.addEventListener("click", function () {
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
            })
    });

    function crearCasilla(data) {
        const casillaDiv = document.createElement("div");

        casillaDiv.innerHTML = `
            <div class="casilla-color" style="background-color:${data.color || 'transparent'}"></div>
            <div class="casilla-nombre">${data.name}</div>
            <div class="casilla-precio">${data.price ? `$${data.price}` : ''}</div>
        `;

        casillaDiv.classList.add("casilla");
        
        if (data.color) {
            casillaDiv.classList.add(data.color);
        }
        return casillaDiv;
    }
});
