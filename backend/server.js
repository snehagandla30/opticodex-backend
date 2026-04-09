const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// temporary in-memory storage
let codes = [];

// ✅ ROOT ROUTE
app.get("/", (req, res) => {
  res.send("🚀 Opticodex Backend is running!");
});

// ===================== RUN PYTHON =====================
app.post("/run_python", (req, res) => {
  try {
    const { code } = req.body;

    return res.status(200).json({
      output: `✅ Code received:\n${code}`,
      error: "",
      has_syntax_error: false
    });
  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
});

// ===================== ANALYZE =====================
app.post("/analyze", (req, res) => {
  try {
    return res.status(200).json({
      score: 9,
      friendly_explanations: ["Code looks clean 👍"],
      suggestions: ["Try adding comments for better readability"],
      suggested_code: null
    });
  } catch (err) {
    return res.status(500).json({
      error: "Analysis failed"
    });
  }
});

// ===================== GET USER CODES =====================
app.post("/my_codes", (req, res) => {
  try {
    const { email } = req.body;

    return res.status(200).json({
      codes: codes.filter(c => c.email === email),
    });
  } catch (err) {
    return res.status(500).json({
      codes: []
    });
  }
});

// ===================== SAVE CODE =====================
app.post("/save_code", (req, res) => {
  try {
    const { email, title, codeSnippet, score } = req.body;

    codes.push({ email, title, code: codeSnippet, score });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

// ===================== DELETE CODE =====================
app.post("/delete_code", (req, res) => {
  try {
    const { email, index } = req.body;

    const userCodes = codes.filter(c => c.email === email);
    const realItem = userCodes[index];

    codes = codes.filter(c => c !== realItem);

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

// ===================== START SERVER =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});