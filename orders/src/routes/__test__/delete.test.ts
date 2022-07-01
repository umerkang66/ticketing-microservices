import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';

it('marks an order as cancelled', async () => {
  // Create a ticket with Ticket model
  const ticket = Ticket.build({
    title: 'ticket',
    price: 20,
  });
  await ticket.save();

  // Make a request to create an order
  const user = getAuthCookie();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  // expectation to make sure the thing cancelled
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder.status).toEqual(OrderStatus.Canceled);
});

it.todo('emits a order cancelled event');