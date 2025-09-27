class RileRoadTile extends Tile {

    constructor(id, name, type, price, mortgage, rent = {}) {
        super(id, name, type);
        this.price = price;
        this.mortgage = mortgage;
        this.rent = rent;
    }

    getPrice() {
        return this.price;
    }

    getmortgage() {
        return this.mortgage;
    }

    getRent() {
        return this.rent;
    }
    
    setPrice(price) {
        if (typeof price !== 'number' || price < 0) {
            throw new TypeError('price debe de ser de tipo number');
        }
        this.price = price;
    }

    setmortgage(mortgage) {
        if (typeof mortgage !== 'number') {
            throw new TypeError('mortgage debe de ser de tipo number');
        }
        this.mortgage = mortgage;
    }

    setRent(rent) {
        if (typeof rent !== 'object' || Array.isArray(rent)) {
            throw new TypeError('rent debe de ser de tipo object');
        }
        this.rent = rent;
    }

    getRentByOwned(count) {
        return this.rent[String(count)] ?? 0;
    }
}

export { RileRoadTile };