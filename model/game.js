import { Player } from "./Player.js"
import { PropertyTile } from "./tiles/propertyTile.js";

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

    async function listarPropiedades() {
        const response = await fetch('http://127.0.0.1:5000/board');
        const respuestaJSON = await response.json();
        console.log(respuestaJSON);

        const allTiles = [
            ...respuestaJSON.bottom
            , ...respuestaJSON.left
            , ...respuestaJSON.top
            , ...respuestaJSON.right
        ]

        console.log("allTiles:", allTiles);
        // Filtrar solo respuestaJSON y railroads
        propiedades = allTiles
            .filter(item => item.type === "property" || item.type === "railroad")
            .map(item => {
                if (item.color === undefined) item.color = "whithe";
                const propiedad = new PropertyTile(item.id, item.color, item.name, item.type);
                if (item.rent) propiedad.setRent(item.rent);
                if (item.price) propiedad.setPrice(item.price);
                if (item.action) propiedad.setAction(item.action);
                if (item.mortage) propiedad.setMortage(item.mortage);

                return propiedad;
            });

        console.log("propiedades:", propiedades);
    }
})