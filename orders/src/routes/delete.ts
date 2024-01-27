import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from "@gzsolutions/common";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { Order, OrderStatus } from "../models/order";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.delete(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      throw new BadRequestError("Invalid order Id");
    }

    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("ticket");
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    //publishing an event saying this was cancelled
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
