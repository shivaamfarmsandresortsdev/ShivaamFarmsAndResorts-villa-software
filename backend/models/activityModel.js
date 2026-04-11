import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    color: { type: String, default: "gray" },
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
