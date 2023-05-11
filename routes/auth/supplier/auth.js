const router = require("express").Router();
const bcrypt = require("bcrypt");
const Supplier = require("../../../models/Supplier");
const { generateToken } = require("../../../helpers/token");
const upload = require("../../../helpers/fileHelper");
const supplierService = require("../../../services/supplier");

/**
 * Register supplier
 */
router.post("/register", upload.single("file"), async (req, res) => {
    try {
      const body = req.body;
      const uploadedFile = req.file ?? null;
      const payload = uploadedFile ? { ...body, uploadedFile } : body;
      const supplier = await supplierService.create(payload);
  
      res.json({ status: "success", data: supplier });
    } catch (error) {
      res.json({ status: "error", message: error });
    }
  });


/**
 * Login a supplier
 */
router.post("/login", async(req, res) => {
    try {
        // Find user by email
        const user = await Supplier.findOne({ email: req.body.email });

        // Check whether the user exists in the database
        if (!user) {
            return res
                .status(404)
                .json(
                    "Supplier with the provided email does not exist, please create an account!"
                );
        }

        // Compare passwords and if password is incorrect, tell the user to try again        
        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!validPassword) {
            return res.status(400).json("Incorrect password, please try again!");
        }

        // Token payload
        const tokenPayload = {
            id: user._id,
            email: user.email,
            isSupplier: true,
        };

        // hide password from the database
        const { password, ...others } = user._doc;

        // If the request is successful, return success message and user details
        return res.status(200).json({
            message: "Supplier login successful",
            ...others,
            token: generateToken(tokenPayload),
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
});

module.exports = router;