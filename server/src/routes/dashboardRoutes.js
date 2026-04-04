const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

const {
  getTotalIncome,
  getTotalExpense,
  getBalance,
  getCategoryStats,
  getMonthlyTrends,
} = require("../controllers/dashboardController");

// Analyst + Admin
router.get("/income", protect, authorize("analyst", "admin"), getTotalIncome);
router.get("/expense", protect, authorize("analyst", "admin"), getTotalExpense);
router.get("/balance", protect, authorize("analyst", "admin"), getBalance);
router.get("/category", protect, authorize("analyst", "admin"), getCategoryStats);
router.get("/trends", protect, authorize("analyst", "admin"), getMonthlyTrends);

module.exports = router;