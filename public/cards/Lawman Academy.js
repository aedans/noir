// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
  text: "Every other turn: gain a Civil Servant.",
  type: "location",
  cost: { money: 60 },
  colors: ["blue"],
  turn: function* () {
    if (util.isInZone(game, card, "board")) {
      const turns = card.props.turns ?? 0;

      yield util.setProp({
        card,
        name: "turns",
        value: (turns + 1) % 2,
      });

      if (turns == 0) {
        yield util.createCard({
          card: util.cid(),
          name: "Civic Servant",
          player: util.cardOwner(game, card),
          zone: "board"
        });
      }
    }
  }
})