// script.js - MODIFICADO
import { Player } from '../model/player.js';

export function generarJugadores(n) {
    console.log(`Generando ${n} jugadores...`);
    const jugadores = document.getElementById("recuadroJugador");
    const iniciar = document.getElementById("botonIniciar");

    jugadores.innerHTML = "";
    iniciar.innerHTML = "";

    fetch("http://127.0.0.1:5000/countries")
        .then(resp => resp.json())
        .then(countries => {
            for (let i = 1; i <= n; i++) {
                const div = document.createElement("div");
                div.className = "col-lg-3 col-md-6 col-12";

                const title = document.createElement("h5");
                title.textContent = `Jugador ${i}`;

                const labelNick = document.createElement("label");
                labelNick.setAttribute("for", `nick-${i}`);
                labelNick.className = "form-label";
                labelNick.textContent = "NickName:";

                const inputNick = document.createElement("input");
                inputNick.id = `nick-${i}`;
                inputNick.className = "form-control";
                inputNick.type = "text";
                inputNick.placeholder = "Ingrese su nombre";

                const labelPais = document.createElement("label");
                labelPais.className = "form-label";
                labelPais.textContent = "País:";

                const select = document.createElement("select");
                select.className = "form-select";
                select.id = `pais-${i}`;

                // opción inicial
                const optionDefault = document.createElement("option");
                optionDefault.textContent = "Seleccione su país";
                optionDefault.disabled = true;
                optionDefault.selected = true;
                select.appendChild(optionDefault);

                // Rellenar opciones con la API
                countries.forEach(countryObj => {
                    const code = Object.keys(countryObj)[0];
                    const name = countryObj[code];

                    const option = document.createElement("option");
                    option.value = name;   // Cambié code por name para que coincida con Player
                    option.textContent = name;
                    select.appendChild(option);
                });

                div.appendChild(title);
                div.appendChild(labelNick);
                div.appendChild(inputNick);
                div.appendChild(labelPais);
                div.appendChild(select);

                jugadores.appendChild(div);
            }

            // 🔹 Crear botón Iniciar al final
            const botonIniciar = document.createElement("button");
            botonIniciar.className = "BottonDeInicio btn btn-outline-success btn-lg";
            botonIniciar.textContent = "Iniciar Juego";

            botonIniciar.onclick = function () {
                const dataJugadores = [];

                for (let i = 1; i <= n; i++) {
                    const nick = document.getElementById(`nick-${i}`).value.trim();
                    const pais = document.getElementById(`pais-${i}`).value;

                    if (!nick || !pais) {
                        alert(`Por favor completa los datos del Jugador ${i}`);
                        return;
                    }

                    // Crear instancia de Player en lugar de objeto simple
                    const nuevoJugador = new Player(
                        i,         // id
                        nick,      // nickname
                        pais,      // country
                        1500,      // balance
                        0,         // position
                        [],        // properties
                        false,     // inJail
                        0          // jailTurns
                    );

                    dataJugadores.push(nuevoJugador);
                }

                // Guardar en localStorage (convertir a objeto plano)
                localStorage.setItem("jugadores", JSON.stringify(dataJugadores.map(jugador => ({
                    nickname: jugador.getNickname(),
                    country: jugador.getCountry(),
                    balance: jugador.getBalance(),
                    position: jugador.getPosition(),
                    properties: jugador.getProperties(),
                    inJail: jugador.getInJail(),
                    jailTurns: jugador.getJailTurns()
                }))));

                // Redirigir al tablero
                window.location.href = "/views/monopoly.html";
            };

            iniciar.appendChild(botonIniciar);
        })
        .catch(error => console.error("Error cargando países:", error));

    }

window.generarJugadores = generarJugadores;
