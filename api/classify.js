import axios from "axios";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const url = req.url;
    const queryString = url.split('?')[1];
    if (!queryString) {
      return res.status(400).json({
        status: "error",
        message: "Name parameter is required"
      });
    }
    const params = new URLSearchParams(queryString);
    let name = params.get('name');
    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Name parameter is required"
      });
    }
    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        status: "error",
        message: "Name parameter is required"
      });
    }
    // Handle nested query
    if (name.includes('?name=')) {
      name = name.split('?name=').pop();
    }

    const response = await axios.get(
      `https://api.genderize.io?name=${encodeURIComponent(name)}`
    );

    const { gender, probability, count } = response.data;

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
    return res.status(502).json({
      status: "error",
      message: "Failed to fetch data from upstream service"
    });
  }
}