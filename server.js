const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

// CORS requirement
app.use(cors({
  origin: "*"
}));

const PORT = process.env.PORT || 3000;

// GET /api/classify?name=john
app.get("/api/classify", async (req, res) => {
  try {
    const { name } = req.query;

    // 400 - missing or empty
    if (!name || name.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Name parameter is required"
      });
    }

    // 422 - not a string
    if (typeof name !== "string") {
      return res.status(422).json({
        status: "error",
        message: "Name must be a string"
      });
    }

    // Call Genderize API
    const response = await axios.get(
      `https://api.genderize.io?name=${name}`
    );

    const { gender, probability, count } = response.data;

    // Edge case
    if (!gender || count === 0) {
      return res.status(422).json({
        status: "error",
        message: "No prediction available for the provided name"
      });
    }

    // Process data
    const sample_size = count;

    const is_confident =
      probability >= 0.7 && sample_size >= 100;

    const processed_at = new Date().toISOString();

    return res.status(200).json({
      status: "success",
      data: {
        name: name.toLowerCase(),
        gender,
        probability,
        sample_size,
        is_confident,
        processed_at
      }
    });

  } catch (error) {
    console.error(error.message);

    return res.status(502).json({
      status: "error",
      message: "Failed to fetch data from upstream service"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});