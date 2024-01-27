import { Message } from "node-nats-streaming";
import { Listener } from "./base-listener";
import { TicketCreatedEvent } from "./ticket-created-event";
import { Subjects } from "./subjects";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  // The next line make sure that we cannot change the value of subject to anything else
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = "payments-service";
  onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    console.log("event data!", data);
    msg.ack();
  }
}
