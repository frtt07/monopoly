export class PropertyTile {
    constructor(color, id, mortage, name, price, rent, type, houses = 0, hotels = 0) {
        //Validaciones de tipo de dato
        if (typeof color !== 'string' || color.trim() === '') {
            throw new TypeError('color debe de ser de tipo string');
        }
        if (typeof id !== 'string' || id.trim() === '') {
            throw new TypeError('id debe de ser de tipo string');
        }
        if (typeof mortage !== 'number' || mortage < 0) {
            throw new TypeError('mortage debe de ser de tipo number');
        }
        if (typeof name !== 'string' || name.trim() === '') {
            throw new TypeError('name debe de ser de tipo string');
        }
        if (typeof price !== 'number' || price < 0) {
            throw new TypeError('price debe de ser de tipo number');
        }
        if (typeof rent !== 'number' || rent < 0) {
            throw new TypeError('rent debe de ser de tipo number');
        }
        if (typeof type !== 'string' || type.trim() === '') {
            throw new TypeError('type debe de ser de tipo string');
        }

        this.color = color.trim();
        this.id = id.trim();
        this.mortage = mortage;
        this.name = name.trim();
        this.price = price;
        this.rent = {
            base: rent.base,
            withHotel: rent.withHotel,
            withHouse: [...rent.withHouse]
        };
        this.type = type.trim();
        this.houses = houses;
        this.hotels = hotels;
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

    setColor(color) {
        if (typeof color !== 'string' || color.trim() === '') {
            throw new TypeError('color debe de ser de tipo string');
        }
        this.color = color.trim();
    }
    setId(id) {
        if (typeof id !== 'string' || id.trim() === '') {
            throw new TypeError('id debe de ser de tipo string');
        }
        this.id = id.trim();
    }
    setMortage(mortage) {
        if (typeof mortage !== 'number' || mortage < 0) {
            throw new TypeError('mortage debe de ser de tipo number');
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
        if (typeof rent !== 'number' || rent < 0) {
            throw new TypeError('rent debe de ser de tipo number');
        }
        this.rent = rent;
    }
    setType(type) {
        if (typeof type !== 'string' || type.trim() === '') {
            throw new TypeError('type debe de ser de tipo string');
        }
        this.type = type.trim();
    }
} export default PropertyTile;