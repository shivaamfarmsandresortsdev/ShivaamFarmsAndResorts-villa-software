import Activity from "../models/activityModel.js";

// Get all recent activities
export const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, data: activities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add a new activity (called by other controllers)
export const addActivity = async (text, color = "gray") => {
  try {
    const activity = new Activity({ text, color });
    await activity.save();
  } catch (err) {
    console.error("Error logging activity:", err.message);
  }
};
