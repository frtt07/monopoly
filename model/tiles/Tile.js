export class Tile {
    constructor(id, name, type) {
        this.id = id;
        this.name = name;
        this.type = type;
    }

    onLand(player) {
        console.log(`${player.getNickname()} ha caido en la casilla ${this.name}`);
    }
}