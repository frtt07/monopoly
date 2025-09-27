export class ChanceTile extends Tile {
  constructor(data) { super(data); }
  trigger(player, game) { game.drawChanceCard(player); } _//Implmentar drawChanceCard en game.js_
}