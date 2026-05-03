const express = require("express");
const { getHistory } = require("../services/firestore");

const router = express.Router();

router.get("/:sessionId", async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId || sessionId.length > 100) return res.status(400).json({ error: "Invalid session ID." });

    const history = await getHistory(sessionId);
    res.json({ sessionId, history });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
