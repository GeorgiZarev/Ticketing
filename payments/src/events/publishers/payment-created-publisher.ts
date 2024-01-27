import { Publisher, PaymentCreatedEvent, Subjects } from "@gzsolutions/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
