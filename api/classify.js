import axios from "axios";

export default async function handler(req, res) {
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

    const sample_size = count;

    const is_confident =
      probability >= 0.7 && sample_size >= 100;

    const processed_at = new Date().toISOString();

    // CORS (VERY IMPORTANT)
    res.setHeader("Access-Control-Allow-Origin", "*");

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
    return res.status(502).json({
      status: "error",
      message: "Failed to fetch data from upstream service"
    });
  }
}