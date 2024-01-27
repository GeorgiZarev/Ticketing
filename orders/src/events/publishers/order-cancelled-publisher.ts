import { Publisher, Subjects, OrderCancelledEvent } from "@gzsolutions/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
