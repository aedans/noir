// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = {
  text: "Every other turn: gain a Civil Servant.",
  type: "location",
  turn: function* (util, game, card) {
    if (util.isInZone(game, card, "board")) {
      yield util.createCard({
        name: "Civic Servant",
        player: util.cardOwner(game, card),
        zone: "board"
      });
    }
  }
}