class RileRoadTile {
    constructor(id, name, price, rent) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.rent = rent;
    }
    getId() {
        return this.id;
    }
    getName() {
        return this.name;
    }   
    getPrice() {
        return this.price;
    }
    getColor() {
        return this.color;
    }
}
export {RileRoadTile};