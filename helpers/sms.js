const AfricasTalking = require("africastalking");
const router = require("express").Router();
// TODO: Initialize Africa's Talking

router.post("/", async (req, res) => {
  // TODO: Send message
  const africastalking = AfricasTalking({
    apiKey: "test1235",
    username: "testsandbox",
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
