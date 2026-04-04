const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/connectDB");

const authRoutes  = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const recordRoutes = require("./routes/recordRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const errorHandler = require("./middlewares/errorMiddleware");

dotenv.config({ path: '../.env' });


const app = express();
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/dashboard", dashboardRoutes);




// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});