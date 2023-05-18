const router = require("express").Router();
const BidItem = require("../../models/BidItem");
const BidService = require("../../services/BidService");
const moment = require("moment");
const UniformBid = require("../../models/UniformBid");

// Create bidItems*********************************************************************
router.post("/", async (req, res) => {
  try {
    const newBidItem = await BidService.bidOnAnAuction(req.body);
    if (newBidItem === 0) {
      return res.status(200).json({
        message: "This auction was closed and does not accept bids any more!",
        bid: newBidItem,
      });
    }
    return res.status(200).json({
      message: "Bid successfully submitted!",
      bid: newBidItem,
    });
  } catch (err) {
    console.log(err, "Error occured creating bid");
    return res.status(500).json(err);
  }
});

// Update bid item ************************************************************
router.put("/:id", async (req, res) => {
  try {
    const updatedItem = await BidService.updateBidItem(req.params.id, req.body);
    return res.status(200).json({
      message: "Bid Item has been updated successfully!",
      updatedItem,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json(res);
  }
});

// Get all bidItems of a partcular farmer's produce ***************************
router.get("/findbids/:farmerId/:itemname", async (req, res) => {
  try {
    const bidItems = await BidItem.find({
      farmerId: req.params.farmerId,
      itemname: req.params.itemname,
    })
      .sort({ buyerprice: -1, createdAt: -1 })
      .limit(5);
    return res.status(200).json(bidItems);
  } catch (err) {
    console.log(err);
    return res.status(200).json(err);
  }
});

// GET ALL BIDS WHERE ACCEPTED PRICE AND ACCEPTED TIME IS NOT NULL *********************************
router.get("/findbids/acceptedones", async (req, res) => {
  try {
    const boughtItems = await BidItem.find({
      accepteddate: { $exists: true, $ne: null },
      acceptedtime: { $exists: true, $ne: null },
    });
    return res.status(200).json(boughtItems);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// GET ALL BIDS WHERE ACCEPTED PRICE AND ACCEPTED TIME IS NOT NULL FOR A PARTICLUAR PRODUCE *********************************
router.get("/findbids/acceptedones/byitem/:itemname", async (req, res) => {
  try {
    const boughtItems = await BidItem.find({
      accepteddate: { $exists: true, $ne: null },
      acceptedtime: { $exists: true, $ne: null },
      itemname: req.params.itemname,
    });

    return res.status(200).json(boughtItems);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// get bids for the graph in 30 minutes interval

router.get("/graph", async (req, res) => {
  try {
    // Get the current time
    const currentTime = moment();

    // Calculate the start time (2 hours before the current time)
    const startTime = moment(currentTime).subtract(2, "hours");

    // Format the start and end times as ISO strings for use in the query
    const start = startTime.toISOString();
    const end = currentTime.toISOString();

    const interval = 30 * 60 * 1000; // 30 minutes in milliseconds

    const data = await BidService.fetchBidItems(start, end, interval);
    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

// accept bid
router.put("/accept/:id", async (req, res) => {
  try {
    const bidAccepted = await BidService.acceptBid(req.params.id);

    if (bidAccepted === 0) {
      return res.status(200).json({
        message:
          "You have already accepted a Bid on this auction. Congraturations!.",
      });
    }
    return res.status(200).json({
      message: "Bid accepted successfully. The buyer has been informed.",
    });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

router.get("/", async (req, res) => {
  try {
    const { filter } = req.query;
    delete req.query.filter;

    const bidItems = await BidService.getBidItems(filter, req.query);
    return res.status(200).json(bidItems);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// SIMPLIFIED END POINTS**************************************************************************
// CREATE  A BID
router.post("/newbid", async (req, res) => {
  try {
    const { farmerId, buyerId, itemname } = req.body;
    // Check if the buyer trying to bid has already made a bid on this very item of the same farmer
    const alreadyBidItem = await BidItem.findOne({
      farmerId,
      buyerId,
      itemname,
    });
    if (alreadyBidItem) {
      return res
        .status(400)
        .json("You have already submitted a bid for this item!");
    } else {
      const newBid = new BidItem(req.body);
      const savedBid = await newBid.save();

      //   CREATE A UNIFORM BID HERE(CAPTURES NUMBER OF BIDS PER ITEM)
      //   REGISTER FARMER IN DISTRICT HERE *******
      try {
        const existingBid = await UniformBid.findOneAndUpdate(
          { farmerId: req.body.farmerId, itemname: req.body.itemname },
          { $inc: { numberOfBids: 1 } },
          { new: true }
        );
        if (existingBid) {
          existingBid.numberOfBids += 1;
          console.log("field updated");
        } else {
          const { farmerId, itemname, itemprice, itemimage } = req.body;
          const newUniformBid = new UniformBid({
            farmerId,
            itemname,
            itemprice,
            itemimage,
          });
          const savedUniformBid = await newUniformBid.save();
          console.log(savedUniformBid);
        }
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }

      return res.status(201).json(savedBid);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// FIND BIDS BY FARMERID AND ITEMNAME ***
router.get("/findbidsbyfarmerId/:farmerId/:itemname", async (req, res) => {
  try {
    const { farmerId, itemname } = req.params;

    const bidItems = await BidItem.find({
      farmerId,
      itemname,
    });
    return res.status(200).json(bidItems);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});
// FIND BIDS BY FARMERID AND ITEMNAME ***
router.get("/findbidsbyfarmerId/:farmerId/:itemname", async (req, res) => {
  try {
    const { farmerId, itemname } = req.params;

    const bidItems = await BidItem.find({
      farmerId,
      itemname,
    });
    return res.status(200).json(bidItems);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// FIND UNIFORM BIDS BY FARMERID ***
router.get("/finduniformbidsbyfarmerId/:farmerId", async (req, res) => {
  try {
    const { farmerId, itemname } = req.params;

    const bidItems = await UniformBid.find({
      farmerId,
    });
    return res.status(200).json(bidItems);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});
module.exports = router;
