const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({origin: "http://localhost:5173",}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello backend");
});

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
