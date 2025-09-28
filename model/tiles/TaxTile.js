class TaxTile extends Tile {
    constructor(id, name, type, action) {
        super(id, name, type);
        this.action = action //Verficar la accion
    }

    getAction() {
        return this.action;
    }

    setAction(action) {
        if (typeof action !== 'object' || Array.isArray(action)) {
            throw new TypeError('action debe de ser de tipo object');
        }
        this.action = action;
    }

    //Aplica la accion del impuesto al jugador
    apply(player) {
    if (this.action?.money) {
      player.setBalance(this.action.money);
    }
  }

}
export { TaxTile };
