import { Schema, model, Document } from "mongoose";

export interface IProduct extends Document {
  productId: String;
  name: String;
  description: String;
  imageURI: String;
  sellerAddress: String;
  price: String;
  txHash: String;
}

const ProductSchema = new Schema<IProduct>(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    imageURI: {
      type: String,
      required: true,
    },
    sellerAddress: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    txHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default model<IProduct>("Product", ProductSchema);
