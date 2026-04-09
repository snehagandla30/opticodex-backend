const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// temporary in-memory storage
let codes = [];

// ✅ ROOT ROUTE
app.get("/", (req, res) => {
  res.send("🚀 Opticodex Backend is running!");
});

// ===================== RUN PYTHON =====================
app.post("/run_python", (req, res) => {
  const { code } = req.body;

  res.json({
    output: `✅ Code received:\n${code}`,
    error: "",
    has_syntax_error: false
  });
});

// ===================== ANALYZE =====================
app.post("/analyze", (req, res) => {
  res.json({
    score: 9,
    friendly_explanations: ["Code looks clean 👍"],
    suggestions: ["Try adding comments for better readability"],
    suggested_code: null
  });
});

// ===================== GET USER CODES =====================
app.post("/my_codes", (req, res) => {
  const { email } = req.body;

  res.json({
    codes: codes.filter(c => c.email === email),
  });
});

// ===================== SAVE CODE =====================
app.post("/save_code", (req, res) => {
  const { email, title, codeSnippet, score } = req.body;

  codes.push({ email, title, code: codeSnippet, score });

  res.json({ success: true });
});

// ===================== DELETE CODE =====================
app.post("/delete_code", (req, res) => {
  const { email, index } = req.body;

  const userCodes = codes.filter(c => c.email === email);
  const realItem = userCodes[index];

  codes = codes.filter(c => c !== realItem);

  res.json({ success: true });
});

// ===================== START SERVER =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});