import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import mongoose from "mongoose";
import { TicketUpdatedEvent } from "@gzsolutions/common";
import { Message } from "node-nats-streaming";

const setup = async () => {
  // Create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);
  // Create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Test ticket",
    price: 100,
  });
  await ticket.save();
  // Create a fake data object
  const data: TicketUpdatedEvent["data"] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: "Update ticket",
    price: 400,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  // Create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  // Return everything
  return { listener, ticket, data, msg };
};

it("Finds updates and saves a ticket ", async () => {
  const { listener, ticket, data, msg } = await setup();
  // Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  // Write assertions to make sure a ticket was updated
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it("Acks the message", async () => {
  const { listener, ticket, data, msg } = await setup();

  // Call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // Write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});

it("Does not call ack if the event has a skipped version number", async () => {
  const { listener, ticket, data, msg } = await setup();

  data.version = 10;

  try {
    await listener.onMessage(data, msg);
  } catch (error) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
