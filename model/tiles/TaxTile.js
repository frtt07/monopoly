class TaxTile {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.action = data.action; // { money: -200 }
    }

    applyTax(player) {
        player.updateBalance(this.action.money);
    }

    getName() {
        return this.name;
    }

    getAmount() {
        return this.action.money;
    }
}
