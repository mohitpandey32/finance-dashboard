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

router.use(protect);

// specific routes first
router.get("/",    authorize("analyst", "admin"), getRecords);
router.post("/",   authorize("admin"), validateRecord, createRecord);

// parameterized routes after
router.get("/:id",    authorize("analyst", "admin"), getRecordById);
router.patch("/:id",  authorize("admin"), updateRecord);
router.delete("/:id", authorize("admin"), deleteRecord);

module.exports = router;