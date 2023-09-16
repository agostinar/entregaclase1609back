const express = require('express');
const router = express.Router();
module.exports = router;

const cartSchema = new mongoose.Schema({
    // Otras propiedades de carrito...
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  });
  
  const Cart = mongoose.model("Cart", cartSchema);
  