exports.validateRecord = (req, res, next) => {
  const { amount, type, category, date } = req.body;

  if (!amount) {
    return res.status(400).json({ message: "Amount is required" });
  }

  if (amount <= 0) {
    return res.status(400).json({ message: "Amount must be greater than 0" });
  }

  if (!type) {
    return res.status(400).json({ message: "Type is required" });
  }

  if (!["income", "expense"].includes(type)) {
    return res.status(400).json({ message: "Type must be 'income' or 'expense'" });
  }

  if (!category) {
    return res.status(400).json({ message: "Category is required" });
  }

  if (date && isNaN(new Date(date))) {
    return res.status(400).json({ message: "Invalid date format" });
  }

  next(); // 🔥 Important
};