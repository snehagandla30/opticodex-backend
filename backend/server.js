const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// temporary in-memory storage
let codes = [];

// ✅ ROOT ROUTE (fixes "Cannot GET /")
app.get("/", (req, res) => {
  res.send("🚀 Opticodex Backend is running!");
});

// GET USER CODES
app.post("/my_codes", (req, res) => {
  const { email } = req.body;

  res.json({
    codes: codes.filter(c => c.email === email),
  });
});

// SAVE CODE
app.post("/save_code", (req, res) => {
  const { email, title, code } = req.body;

  codes.push({ email, title, code });

  res.json({ success: true });
});

// DELETE CODE
app.post("/delete_code", (req, res) => {
  const { email, index } = req.body;

  const userCodes = codes.filter(c => c.email === email);
  const realItem = userCodes[index];

  codes = codes.filter(c => c !== realItem);

  res.json({ success: true });
});

// ✅ IMPORTANT: use dynamic port for Render
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});