const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected profile route accessed successfully",
    user: req.user,
  });
});

router.get("/admin-only", protect, authorize("admin"), (req, res) => {
  res.json({
    message: "Welcome Admin, you can access this route",
  });
});

router.get(
  "/analyst-admin",
  protect,
  authorize("analyst", "admin"),
  (req, res) => {
    res.json({
      message: "Welcome Analyst/Admin, you can access this route",
    });
  }
);

module.exports = router;