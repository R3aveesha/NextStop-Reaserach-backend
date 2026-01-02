const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const adminAuthRoutes = require("./routes/Admin/adminAuthRoutes");
const busRoutes = require("./routes/Bus/busRoutes");
const superAdminAuthRoutes = require("./routes/SuperAdmin/superAdminAuthRoutes");
const predictionController = require("./controllers/predictionController");
const predictiveTimeBusRoutes = require("./routes/predictiveTimeBusRoutes");


dotenv.config();
const app = express();

const { MONGO_URI, PORT } = process.env;

if (!MONGO_URI) {
  console.error("Missing MONGO_URI environment variable. Set it in a .env file at the project root.");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

app.use("/api/admin", adminAuthRoutes);
app.use("/api/buses", busRoutes); 
app.use("/api/superadmin", superAdminAuthRoutes);
app.post("/api/predict", predictionController.getPredictionAndSave);
app.use("/api/predictive-time-buses", predictiveTimeBusRoutes);

// MongoDB Connection
mongoose
  .connect(MONGO_URI) // removed deprecated options
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

// Server Running
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoint: POST http://localhost:${PORT}/api/predict`);
  console.log('Start Flask service on Port 5000 BEFORE testing');
});