import express from "express";
import axios from "axios";

const router = express.Router();

// POST /api/run
router.post("/run", async (req, res) => {
  const { code, language = "cpp", input = "" } = req.body;

  if (!code) {
    return res.status(400).json({ output: "No code provided" });
  }

  try {
    // Forward code to online-compiler microservice
    const response = await axios.post("http://localhost:5001/run", {
      code,
      language,
      input,
    });

    // Return output or compiler error from microservice
    return res.status(200).json({
      output: response.data.output || response.data.error || "No output",
    });
  } catch (error) {
    const errData = error.response?.data;

    // Extract error message
    const errMsg =
      typeof errData === "string"
        ? errData
        : errData?.output ||
          errData?.error ||
          errData?.stderr ||
          error.message ||
          "An unknown error occurred";

    if (error.response) {
      // Microservice responded — likely a compilation error (handled gracefully)
      return res.status(200).json({ output: errMsg });
    } else {
      // Microservice did not respond — server/microservice down
      return res.status(500).json({
        output: "Compiler service is unavailable. Please try again later.",
      });
    }
  }
});

export default router;
