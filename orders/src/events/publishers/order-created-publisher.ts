import { Subjects, OrderCreatedEvent, Publisher } from "@gzsolutions/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
