const SupplierProductModel = require("../models/supplierProduct");

const supplierProductService = {
  /**
   * Gets all supplier products
   * @returns
   */
  async get() {
    return await SupplierProductModel.find()
      .populate({ path: "supplySubCategory" })
      .populate({ path: "supplier", select: ["-password"] });
  },

  /**
   * Gets the products under a supply category
   * @returns Promise
   */
  async getSupplierProductsBySubCategory(id) {
    return await SupplierProductModel
      .find({ supplySubCategory: id })
      .populate("supplier")
      .exec();
  },

  /**
   * Gets the products that belong to the supplier
   * @param {*} id 
   * @returns 
   */
  async getSupplierProductsBySupplier(id) {
    return await SupplierProductModel
      .find({ supplier: id })
      .populate("supplySubCategory")
      .exec();
  },

  /**
   * Creates a new supplier product and returns it
   * @param {*} data
   * @returns
   */
  async create(data) {
    const supplierProduct = new SupplierProductModel({
      product: data.product,      
      price: data.price,
      quantity: data.quantity,
      availability: data.availability,
      image: data.uploadedFile?.location ?? "",
      url: data.url,
      supplier: data.supplier,
      supplySubCategory: data.supplySubCategory,
    });

    return await supplierProduct.save();
  },

  /**
   * Updates a supplier product
   * @param {*} supplierProductId
   * @param {*} data
   */
  async update(supplierProductId, data) {
    const supplierProduct = await SupplierProductModel.findByIdAndUpdate(
      supplierProductId,
      { $set: data },
      { new: true }
    );

    return supplierProduct;
  },

  /**
   * Deletes a supplier product
   * @param {*} supplierProductId
   */
  async delete(supplierProductId) {
    await SupplierProductModel.findByIdAndDelete(supplierProductId);
  },
};

module.exports = supplierProductService;
