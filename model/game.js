import { Player } from "./player.js"
import PropertyTile from "./propertyTile.js";

class Game {

    constructor(players = []) {
        if (!Array.isArray(players)) {
            throw new TypeError("players debe ser un array de Player");
        }
        players.forEach((player, i) => {
            if (!(player instanceof Player)) {
                throw new TypeError(`Elemento en players[${i}] no es Player`);
            }
        });
        this.players = [];
    }

}

document.addEventListener("DOMContentLoaded", () => {
    listarPropiedades();
    let propiedades = [];

    function listarPropiedades() {
        fetch('http://127.0.0.1:5000/board')
            .then(response => response.json())
            .then(data => {
                console.log("Propiedades:", data);

                // Unir todas las casillas en un solo array
                const allTiles = [
                    ...data.bottom,
                    ...data.top,
                    ...data.left,
                    ...data.right
                ];

                // Filtrar solo propiedades y railroads
                propiedades = allTiles
                    .filter(item => item.type === "property" || item.type === "railroad")
                    .map(item => new PropertyTile(item.id, item.name, item.color));

                console.log("Propiedades cargadas:", propiedades);
                console.log(propiedades[0].toJSON());
            })
            .catch(error => console.error('Error al cargar las propiedades:', error));
    }
});
;