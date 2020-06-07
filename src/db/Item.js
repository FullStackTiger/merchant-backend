import mongoose from 'mongoose';

const Item = mongoose.model('Item', {
  id: String, // Item UUIDv4 ID
  name: String, // Merchant Name, but currently set to food item name
  description: String, // Item long description
  price: Number, // Food Item Price
  reviews: Number, // Item Number of Reviews
  stars: Number, // Item average star rating
  imageUrl: String, // Food Item Image
  merchantId: String, // Refers to Merchant.id
});

export default Item;

