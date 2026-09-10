import { InferSchemaType, model, Schema } from 'mongoose';

const productSchema = new Schema(
  {
    image: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    color: { type: String, required: true },
    // without enum bcs when new product appears with new capacity then we would need to change code here
    capacity: { type: Number, required: true, min: 1 },
    // split into 3 fields bcs as one string we never know which number means what
    dimensions: {
      depth: { type: Number, required: true, min: 1 },
      width: { type: Number, required: true, min: 1 },
      height: { type: Number, required: true, min: 1 },
      unit: { type: String, required: true },
    },
    // without enum - same situation as with capacity property
    features: { type: [String], required: true },
    energyClass: { type: String, required: true, enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
    price: {
      value: { type: Number, required: true },
      currency: { type: String, required: true },
      installment: {
        value: { type: Number, required: true },
        period: { type: Number, required: true },
      },
      validFrom: { type: Date, required: true },
      validTo: { type: Date, required: true },
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        const { _id, ...rest } = ret;
        return rest;
      },
    },
  }
);

export type Product = InferSchemaType<typeof productSchema>;

export const ProductModel = model('Product', productSchema);
