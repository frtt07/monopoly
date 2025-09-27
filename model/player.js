import PropertyTile from "./propertyTile.js"; 
import  {RileRoadTile}  from "./rileRoadTile.js";   

export class Player {
    constructor(nickname, country, balance = 1500, position = 0, properties = [], inJail = false, jailTurns = 0,) {
        // Validación que sea un array
        if (!Array.isArray(properties)) {
            throw new TypeError("properties debe ser un array de PropertyTile");
        }

        //validar que cada elemento sea instancia de PropertyTile
        properties.forEach((prop, i) => {
            if (!(prop instanceof PropertyTile || prop instanceof RileRoadTile)) {
                throw new TypeError(`Elemento en properties[${i}] no es PropertyTile`);
            }
        });

        if (typeof nickname !== 'string' || nickname.trim() === '') {
            throw new TypeError('nickname debe de ser de tipo string');
        }

        this.nickname = nickname;
        this.country = country;
        this.balance = balance;
        this.position = position;
        this.properties = properties;
        this.inJail = inJail;
        this.jailTurns = jailTurns;
    }

    getNickname() {
        return this.nickname;
    }
    getCountry() {
        return this.country;
    }
    getBalance() {
        return this.balance;
    }
    getPosition() {
        return this.position;
    }
    getProperties() {
        return this.properties;
    }
    getInJail() {
        return this.inJail;
    }
    getJailTurns() {
        return this.jailTurns;
    }

    setposition(newPosition) {
        if (typeof newPosition !== 'number' || newPosition < 0) {
            throw new TypeError('newPosition debe de ser de tipo number');
        }
        this.position = newPosition;
    }
    setInJail(status) {
        if (typeof status !== 'boolean') {
            throw new TypeError('status debe de ser de tipo boolean');
        }
        this.inJail = status;
    }

    addProperty(property) {
        if (!(property instanceof PropertyTile)) {
            throw new TypeError("property debe ser una instancia de PropertyTile");
        }
        this.properties.push(property);
    }

    removeProperty(propertyId) {
        const index = this.properties.findIndex(prop => prop.getId() === propertyId);
        if (index !== -1) {
            this.properties.splice(index, 1);
        } else {
            throw new Error(`No se encontró la propiedad con id: ${propertyId}`);
        }
    }
    
    updateBalance(amount) {
        if (typeof amount !== 'number') {
            throw new TypeError('amount debe ser de tipo number');
        }
        this.balance += amount;
    }

    PlayertoJSON() {
        return {
            nickname: this.nickname,
            country: this.country,
            balance: this.balance,
            position: this.position,
            properties: this.properties.map(prop => prop.getId()), // Guardar solo los IDs de las propiedades  
            inJail: this.inJail,
            jailTurns: this.jailTurns
        };
    }

    buyProperty(property) {
        if (!(property instanceof PropertyTile || property instanceof RileRoadTile)) {
            throw new TypeError("property debe ser una instancia de PropertyTile o RileRoadTile");
        }
        if (this.balance >= property.getPrice()) {
            this.updateBalance(-property.getPrice());
            this.addProperty(property);
        } else {
            throw new Error("Fondos insuficientes para comprar la propiedad");
        }
    }
}
export default Player;