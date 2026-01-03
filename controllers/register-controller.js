import { registerUser } from "../models/register-model.js";

async function register(req, res) {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No data provided." });
  }

  try {
    const response = await registerUser(req.body);

    // Defensive: check if response is an array and has at least one element with response_json
    if (
      Array.isArray(response) &&
      response.length > 0 &&
      response[0] &&
      typeof response[0].response_json !== "undefined"
    ) {
      return res.json(response[0].response_json);
    } else {
      // If response is not as expected, return a 500 error
      return res
        .status(500)
        .json({
          success: false,
          message: "Unexpected response from registerUser.",
        });
    }
  } catch (error) {
    console.error("Register error:", error);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
}
export { register };
