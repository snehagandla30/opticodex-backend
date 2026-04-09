const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// temporary in-memory storage
let codes = [];

app.post("/my_codes", (req, res) => {
  const { email } = req.body;

  res.json({
    codes: codes.filter(c => c.email === email),
  });
});

app.post("/save_code", (req, res) => {
  const { email, title, code } = req.body;

  codes.push({ email, title, code });

  res.json({ success: true });
});

app.post("/delete_code", (req, res) => {
  const { email, index } = req.body;

  const userCodes = codes.filter(c => c.email === email);

  const realItem = userCodes[index];

  codes = codes.filter(c => c !== realItem);

  res.json({ success: true });
});

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});