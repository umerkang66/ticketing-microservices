// this is for population ticket in order, here are the only properties, that order service cares about
import mongoose from 'mongoose';
import { Order, OrderStatus } from './order';

interface TicketAttrs {
  title: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
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

// Document Methods
ticketSchema.methods.isReserved = async function () {
  // here "this" is current document

  // Make sure that this ticket is not already reserved, find the order whose ticket is the ticket we just fetched *and* and the order status is *not* canceled, if we find an order, that means the ticket is reserved
  const existingOrder = await Order.findOne({
    // because this is a reference, only "id" is being checked
    ticket: this,
    status: {
      // status should be in this array
      $in: [
        // it should not be canceled
        OrderStatus.Created,
        OrderStatus.Complete,
        OrderStatus.AwaitingPayment,
      ],
    },
  });

  return existingOrder !== null;
};

// Model Methods
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('tickets', ticketSchema);

export { Ticket };