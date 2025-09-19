function generarJugadores(n){
    const jugadores= document.getElementById("recuadroJugador");
    const iniciar= document.getElementById("botonIniciar");

    jugadores.innerHTML="";
    iniciar.innerHTML="";

    for (let i=1; i<=n; i++){
        const div= document.createElement("div");
        div.className= "col-lg-3 col-md-6 col-12";
        div.innerHTML= `

        <h5> Jugador ${i}</h5>

        <div><label>NickName:</label></div>
        <div><input type="text"</div>

        <div><label>País:</label></div>
        <div><select> </select></div>
        `;
        jugadores.appendChild(div);
    };

    const botonIniciar = document.createElement("button");
    botonIniciar.className= "BottonDeInicio";
    botonIniciar.textContent= "Iniciar Juego";
    botonIniciar.onclick= function(){
        alert("Welcome Monopoly");
    };
    iniciar.appendChild(botonIniciar);
}