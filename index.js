const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get("/", (req, res) => {
  res.send("✅ Rolimons proxy is running. Use /worth/:userid");
});

app.get("/worth/:userid", async (req, res) => {
  try {
    const userId = req.params.userid;

    const assetsRes = await axios.get(`https://www.rolimons.com/playerapi/playerassets/${userId}`);
    const assetIds = assetsRes.data.playerAssets[userId];

    if (!assetIds || assetIds.length === 0) {
      return res.json({
        rap: 0,
        estimated_value: 0,
        item_count: 0
      });
    }

    const itemDataRes = await axios.get("https://www.rolimons.com/itemapi/itemdetails");
    const items = itemDataRes.data.items;

    let totalRAP = 0;
    let totalValue = 0;

    for (const id of assetIds) {
      const item = items[id];
      if (item) {
        totalRAP += item[2];   // RAP
        totalValue += item[3]; // Value
      }
    }

    res.json({
      rap: totalRAP,
      estimated_value: totalValue,
      item_count: assetIds.length
    });

  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Failed to fetch Rolimons data." });
  }
});

app.listen(port, () => {
  console.log(`✅ Proxy server running on port ${port}`);
});
