var Board = require("../models/board");

exports.index = function (req, res, next) {
  Board.find({ id: req.session.id }).exec(function (err, sessionBoard) {
    if (err) {
      return next(err);
    }
  });
};
