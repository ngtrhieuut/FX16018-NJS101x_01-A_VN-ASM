const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  idStaff: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  doB: {
    type: Date,
    required: true
  },
  salaryScale: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  startShift: {
    type: String,
    required: true
  },
  endShift: {
    type: String,
    required: true
  },
  annualLeave: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  status: [{status: {type: Boolean}}],
  vaccinated: [{count: {type: Number}, vaccinateName: {type: String}, time: {type: Date}}],
  covidCheck: {
    type: Boolean,
  }

});

userSchema.methods.addToCart = function(product) {
//   const cartProductIndex = this.cart.items.findIndex(cp => {
//     return cp.productId.toString() === product._id.toString();
//   });
//   let newQuantity = 1;
//   const updatedCartItems = [...this.cart.items];

//   if (cartProductIndex >= 0) {
//     newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//     updatedCartItems[cartProductIndex].quantity = newQuantity;
//   } else {
//     updatedCartItems.push({
//       productId: product._id,
//       quantity: newQuantity
//     });
//   }
//   const updatedCart = {
//     items: updatedCartItems
//   };
//   this.cart = updatedCart;
//   return this.save();
};

// userSchema.methods.removeFromCart = function(productId) {
//   const updatedCartItems = this.cart.items.filter(item => {
//     return item.productId.toString() !== productId.toString();
//   });
//   this.cart.items = updatedCartItems;
//   return this.save();
// };

// userSchema.methods.clearCart = function() {
//   this.cart = { items: [] };
//   return this.save();
// };

module.exports = mongoose.model('User', userSchema);
