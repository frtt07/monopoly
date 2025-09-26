import { Player } from "./player"

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