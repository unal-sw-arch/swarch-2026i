import { EventPublisher } from './event.publisher';
import { Logger } from '@nestjs/common';

describe('EventPublisher (Biblia Pág. 20 Compliance)', () => {
  let publisher: EventPublisher;

  beforeEach(() => {
    publisher = new EventPublisher();
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  it('Debe emitir el evento con la estructura JSON exacta requerida', async () => {
    const payload = {
      restaurantId: 10,
      menuItemId: 101,
      isAvailable: false,
    };

    const spy = jest.spyOn(Logger.prototype, 'log');
    await publisher.publish('PRODUCT_AVAILABILITY_CHANGED', payload);

    const callArgs = spy.mock.calls[0][0];
    const loggedEvent = JSON.parse(callArgs.replace('[Event Broker A1 Publisher] Publishing event: ', ''));

    expect(loggedEvent).toMatchObject({
      eventType: 'PRODUCT_AVAILABILITY_CHANGED',
      payload: {
        restaurantId: 10,
        menuItemId: 101,
        isAvailable: false
      }
    });
    expect(loggedEvent).toHaveProperty('timestamp');
    expect(new Date(loggedEvent.timestamp).getTime()).not.toBeNaN();
  });
});
