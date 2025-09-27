import { Tile } from "./tile.js";

export class PropertyTile extends Tile {
    constructor(id, name, type, color, price, rent = {}, mortgage) {
        super(id, name, type, color);
        this.price = price;
        this.rent = rent;
        this.mortgage = mortgage;
    }

    getRent(houses = 0, hotel = false) {
    if (hotel) return this.rent.withHotel ?? this.rent.base;
    if (houses > 0 && Array.isArray(this.rent.withHouse)) {
      const arr = this.rent.withHouse;
      return arr[houses - 1] ?? this.rent.base;
    }
    return this.rent.base;
  }

    onLand(player) {
        console.log(`${player.getNickname()} ha caido en la casilla ${this.name}`);
    }

    getColor() {
        return this.color;
    }

    getmortgage() {
        return this.mortgage;
    }

    getPrice() {
        return this.price;
    }

    getRent() {
        return this.rent;
    }


    setColor(color) {
        if (typeof color !== 'string' || color === '') {
            throw new TypeError('color debe de ser de tipo string');
        }
        this.color = color;
    }

    setmortgage(mortgage) {
        if (typeof mortgage !== 'number') {
            throw new TypeError('mortgage debe de ser de tipo number');
        }
        this.mortgage = mortgage;
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

} export default PropertyTile;