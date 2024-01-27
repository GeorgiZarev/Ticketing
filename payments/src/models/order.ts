import mongoose, { NullExpression } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { OrderStatus } from "@gzsolutions/common";

// List of properties we have to provide when building a new Order
interface OrderAttrs {
  id: string;
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

//List of properties that an Order has
interface OrderDoc extends mongoose.Document {
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

//List of properties that the model contains
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

OrderSchema.set("versionKey", "version");
OrderSchema.plugin(updateIfCurrentPlugin);

OrderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    version: attrs.version,
    userId: attrs.userId,
    price: attrs.price,
    status: attrs.status,
  });
};

const Order = mongoose.model<OrderDoc, OrderModel>("Order", OrderSchema);
export { Order };
