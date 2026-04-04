const Record = require("../models/Record");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

// no userId param — company-wide aggregation
async function fetchBalanceSummary() {
  const result = await Record.aggregate([
    { $group: { _id: "$type", total: { $sum: "$amount" } } },
  ]);

  const income  = result.find((r) => r._id === "income")?.total  ?? 0;
  const expense = result.find((r) => r._id === "expense")?.total ?? 0;
  return { income, expense, balance: income - expense };
}

exports.getBalance = asyncHandler(async (req, res) => {
  const summary = await fetchBalanceSummary();
  res.json({ success: true, data: summary });
});

exports.getTotalIncome = asyncHandler(async (req, res) => {
  const { income } = await fetchBalanceSummary();
  res.json({ success: true, data: { totalIncome: income } });
});

exports.getTotalExpense = asyncHandler(async (req, res) => {
  const { expense } = await fetchBalanceSummary();
  res.json({ success: true, data: { totalExpense: expense } });
});

exports.getCategoryStats = asyncHandler(async (req, res) => {
  const result = await Record.aggregate([
    // fixed: removed userId filter — company-wide
    {
      $group: {
        _id: { category: "$category", type: "$type" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.type": 1, total: -1 } },
  ]);

  res.json({ success: true, data: result });
});

exports.getMonthlyTrends = asyncHandler(async (req, res) => {
  const raw = parseInt(req.query.months, 10);
  if (req.query.months !== undefined && (isNaN(raw) || raw <= 0)) {
    throw new AppError("months must be a positive integer", 400, "INVALID_PARAM");
  }
  const months = Math.min(raw || 12, 24);

  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const result = await Record.aggregate([
    // fixed: removed userId filter — company-wide, date window kept
    { $match: { date: { $gte: since } } },
    {
      $group: {
        _id: {
          year:  { $year: "$date" },
          month: { $month: "$date" },
          type:  "$type",
        },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  res.json({ success: true, data: result });
});