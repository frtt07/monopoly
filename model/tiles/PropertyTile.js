import { Tile } from "./tile.js";

export class PropertyTile extends Tile  {
    constructor(id, color, name, type) {
        super(id, name, type);
        if (typeof color !== 'string' || color.trim() === '') {
            throw new TypeError('color debe de ser de tipo string');
        }
        if (typeof id !== 'number' || id < 0) {
            throw new TypeError('id debe de ser de tipo number');
        }
        if (typeof name !== 'string' || name.trim() === '') {
            throw new TypeError('name debe de ser de tipo string');
        }
        if (typeof type !== 'string' || type.trim() === '') {
            throw new TypeError('type debe de ser de tipo string');
        }

        this.color = color.trim();
    }

    rent = {
        "base": 0,
        "withHouse": [
        ],
        "withHotel": 0
    }

    mortage = false;
    price = 0;
    action = {}

    onLand(player) {
        console.log(`${player.getNickname()} ha caido en la casilla ${this.name}`);
    }

    getColor() {
        return this.color;
    }
    getId() {
        return this.id;
    }
    getMortage() {
        return this.mortage;
    }
    getName() {
        return this.name;
    }
    getPrice() {
        return this.price;
    }
    getRent() {
        return this.rent;
    }
    getType() {
        return this.type;
    }
    getAction() {
        return this.action;
    }

    setColor(color) {
        if (typeof color !== 'string' || color.trim() === '') {
            throw new TypeError('color debe de ser de tipo string');
        }
        this.color = color.trim();
    }
    setId(id) {
        if (typeof id !== 'number' || id < 0) {
            throw new TypeError('id debe de ser de tipo string');
        }
        this.id = id;
    }
    setMortage(mortage) {
        if (typeof mortage !== 'boolean') {
            throw new TypeError('mortage debe de ser de tipo boolean');
        }
        this.mortage = mortage;
    }
    setName(name) {
        if (typeof name !== 'string' || name.trim() === '') {
            throw new TypeError('name debe de ser de tipo string');
        }
        this.name = name.trim();
    }
    setPrice(price) {
        if (typeof price !== 'number' || price < 0) {
            throw new TypeError('price debe de ser de tipo number');
        }
        this.price = price;
    }
    setRent(rent) {
        if (rent == null || rent == undefined || rent == {}) {
            throw new TypeError('rent no puede estar vacio');
        }
        this.rent = rent;
    }
    setType(type) {
        if (typeof type !== 'string' || type.trim() === '') {
            throw new TypeError('type debe de ser de tipo string');
        }
        this.type = type.trim();
    }

    setAction(action) {
        if (action == null || action == undefined || action == {}) {
            throw new TypeError('action no puede estar vacio');
        }
        this.action = action;
    }


} export default PropertyTile;