import {TestRack} from '../../../test/utilities';

const rack = new TestRack();

describe('metrics', () => {
  afterAll(() => {
    rack.unmountAll();
  });

  it.skip('responds with a Server-Timing header', async () => {
    const wrapper = await rack.mount(({ip, port}) => createServer({port, ip}));
    const response = await wrapper.request();

    expect(response.headers.get('server-timing')).not.toBeNull();
  });
});
