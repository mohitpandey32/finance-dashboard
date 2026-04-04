const express = require("express");
const router = express.Router();

const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");
const { validateRecord } = require("../validators/recordValidator");

const {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} = require("../controllers/recordController");

router.get("/:id", protect, authorize("analyst", "admin"), getRecordById);

// Admin only
router.post("/", protect, authorize("admin"), validateRecord,  createRecord);

// Analyst + Admin
router.get("/", protect, authorize("analyst", "admin"), getRecords);

// Admin only
router.patch("/:id", protect, authorize("admin"), updateRecord);
router.delete("/:id", protect, authorize("admin"), deleteRecord);

module.exports = router;