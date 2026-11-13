const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const AI_LAYER_URL = process.env.AI_LAYER_URL || "http://localhost:3000";

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "backend-layer",
    status: "ok"
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        error: "message is required and must be a string"
      });
    }

    const aiResponse = await axios.post(`${AI_LAYER_URL}/chat`, {
      message,
      history
    });

    return res.status(200).json({
      success: true,
      data: {
        reply: aiResponse.data.reply
      }
    });
  } catch (error) {
    console.error("Error while calling AI layer:", error?.response?.data || error.message);

    return res.status(500).json({
      success: false,
      error: "Failed to get response from AI layer",
      details: error?.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
  console.log(`Connected AI Layer URL: ${AI_LAYER_URL}`);
});