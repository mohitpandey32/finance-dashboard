const Record = require("../models/Record");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const MUTABLE_FIELDS = ["amount", "type", "category", "date", "note"];

//  Create Record (Admin only)
exports.createRecord = asyncHandler(async (req, res) => {
  
    const { amount, type, category, date, note } = req.body;

    

    const record = await Record.create({
      userId: req.user._id,
      amount,
      type,
      category,
      date,
      note,
    });

    res.status(201).json({
  success: true,
  data: record,
});
  
});

//  Get Records (Analyst/Admin)
exports.getRecords = asyncHandler( async (req, res) => {
  
    const { type, category, startDate, endDate } = req.query;

  
    if (startDate && isNaN(new Date(startDate).getTime())) {
    throw new AppError("Invalid startDate format", 400, "INVALID_DATE");
  }
  if (endDate && isNaN(new Date(endDate).getTime())) {
    throw new AppError("Invalid endDate format", 400, "INVALID_DATE");
  }
  let filter = { userId: req.user._id };

    // Optional filters
    if (type) filter.type = type;
    if (category) filter.category = category;

    if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

    const records = await Record.find(filter).sort({ date: -1 });

    res.json({
  success: true,
  count: records.length,
  data: records,
});
  
});

exports.getRecordById = asyncHandler(async (req, res ) => {
  
    const { id } = req.params;

    const record = await Record.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json(record);

});

//  Update Record (Admin only)
exports.updateRecord = asyncHandler(async (req, res) => {
  
    const record = await Record.findOne({
    _id: req.params.id,
    userId: req.user._id,   // fixed: ownership check
  });

  if (!record) throw new AppError("Record not found", 404, "RECORD_NOT_FOUND");

  // fixed: only allow known mutable fields through
  MUTABLE_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) record[field] = req.body[field];
  });

  await record.save();

    res.json({
  success: true,
  data: record,
});
  
});

// Delete Record (Admin only)
exports.deleteRecord = asyncHandler(async (req, res) => {
  const record = await Record.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!record) throw new AppError("Record not found", 404, "RECORD_NOT_FOUND");

  await record.deleteOne();

  res.json({ success: true, message: "Record deleted successfully" });
});