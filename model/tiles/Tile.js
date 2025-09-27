export class Tile {
    constructor(id, name, type) {
        this.id = id;
        this.name = name;
        this.type = type;
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getType() {
        return this.type;
    }

    setId(id) {
        if (typeof id !== 'number' || id < 0) {
            throw new TypeError('id debe de ser de tipo string');
        }
        this.id = id;
    }

    setName(name) {
        if (typeof name !== 'string' || name === '') {
            throw new TypeError('name debe de ser de tipo string');
        }
        this.name = name;
    }

    setType(type) {
        if (typeof type !== 'string' || type === '') {
            throw new TypeError('type debe de ser de tipo string');
        }
        this.type = type;
    }

    onLand(player) {
        console.log(`${player.getNickname()} ha caido en la casilla ${this.name}`);
    }
}