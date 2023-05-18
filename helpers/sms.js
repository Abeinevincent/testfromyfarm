const AfricasTalking = require("africastalking");
const router = require("express").Router();
// TODO: Initialize Africa's Talking

router.post("/", async (req, res) => {
  // TODO: Send message
  const africastalking = AfricasTalking({
    apiKey: "c753de3d126e76645e77a0a32ebddc412bc61080ab84a3aac90bf74ba2db3151",
    username: "sandbox",
  });

  try {
    const result = await africastalking.SMS.send({
      to: "+256700238017",
      message: "Hey AT Ninja! Wassup...",
      from: "14737",
    });
    console.log(result);
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
});

module.exports = router;
