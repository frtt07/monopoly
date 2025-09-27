export class CommunityChestTile extends Tile {
  constructor(data) { super(data); }
  trigger(player, game) { game.drawCommunityCard(player); } _//Implmentar drawCommunityCard en game.js_
}