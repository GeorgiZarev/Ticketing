import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from "@gzsolutions/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
