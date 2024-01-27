import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order } from "../../models/order";
import { OrderStatus } from "@gzsolutions/common";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payment";

it("Returns a 404 when purchasing an order that does not exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "dsadas",
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it("Returns a 401 when purchasing an order that does not belong to the user", async () => {
  const order = await Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "dsadas",
      orderId: order.id,
    })
    .expect(401);
});

it("Returns a 400 when purchasing an order that has already been cancelled", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = await Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 10,
    userId,
    status: OrderStatus.Cancelled,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "dsadas",
      orderId: order.id,
    })
    .expect(400);
});

it("Returns a 204 with valid inputs", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);

  const order = await Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price,
    userId,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });
  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toBe("usd");

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });
  expect(payment).not.toBeNull();
});
