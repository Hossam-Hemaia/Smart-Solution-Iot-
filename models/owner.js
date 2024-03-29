const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ownerSchema = new Schema({
  ownerName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "owner",
  },
  hasAccessTo: [{ entityId: { type: Schema.Types.ObjectId } }],
});

module.exports = mongoose.model("owner", ownerSchema);
