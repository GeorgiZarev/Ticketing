import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import mongoose from "mongoose";
import { Order } from "../../../models/order";
import { OrderStatus, OrderCancelledEvent } from "@gzsolutions/common";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 10,
    version: 0,
  });

  await order.save();

  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    version: 1,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
    },
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, order };
};

it("Updates the status of the order ", async () => {
  const { listener, data, msg, order } = await setup();
  await listener.onMessage(data, msg);

  const updateOrder = await Order.findById(order.id);

  expect(updateOrder!.status).toBe(OrderStatus.Cancelled);
});

it("Acks the message", async () => {
  const { listener, data, msg, order } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
