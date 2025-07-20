import { expect } from 'chai';
import sinon from 'sinon';
import { HTTPTransport } from './HTTPTransport.js';

interface ExtendedFakeRequest extends sinon.SinonFakeXMLHttpRequest {
  ontimeout: () => void;
  onabort: () => void;
  onerror: () => void;
}

describe('HTTPTransport', () => {
  let requests: ExtendedFakeRequest[] = [];
  let xhrFake: sinon.SinonFakeXMLHttpRequestStatic;

  beforeEach(() => {
    requests = [];

    xhrFake = sinon.useFakeXMLHttpRequest();
    xhrFake.onCreate = (req) => {
      requests.push(req as ExtendedFakeRequest);
    };

    global.XMLHttpRequest = xhrFake as unknown as typeof XMLHttpRequest;
  });

  afterEach(() => {
    xhrFake.restore();
    global.XMLHttpRequest = window.XMLHttpRequest;
  });

  it('GET должен сериализовать query-параметры и отправить запрос', async () => {
    const http = new HTTPTransport('https://example.com');
    const promise = http.get('/test', { data: { a: 1, b: 'two' } });

    await Promise.resolve();

    const req = requests[0];
    if (!req) throw new Error('Запрос не создан! xhrFake.onCreate не сработал.');

    expect(req.method).to.equal('GET');
    expect(req.url).to.equal('https://example.com/test?a=1&b=two');

    req.respond(200, {}, 'OK');

    const response = await promise;
    expect(response.status).to.equal(200);
  });

  it('POST должен отправить тело и выставить Content-Type', async () => {
    const http = new HTTPTransport('/api');
    const data = { name: 'John' };

    const promise = http.post('/user', { data });

    await Promise.resolve();

    const req = requests[0];
    expect(req.method).to.equal('POST');
    expect(req.url).to.equal('/api/user');

    expect(req.requestHeaders['Content-Type']).to.match(/^application\/json/);
    expect(req.requestBody).to.equal(JSON.stringify(data));

    req.respond(200, {}, 'OK');
    const response = await promise;
    expect(response.status).to.equal(200);
  });

  it('PUT должен работать как ожидалось', async () => {
    const http = new HTTPTransport();
    const promise = http.put('/update', { data: { id: 123 } });

    await Promise.resolve();

    const req = requests[0];
    expect(req.method).to.equal('PUT');

    req.respond(200, {}, 'updated');
    const response = await promise;
    expect(response.status).to.equal(200);
  });

  it('DELETE должен отправить запрос', async () => {
    const http = new HTTPTransport();
    const promise = http.delete('/remove');

    await Promise.resolve();

    const req = requests[0];
    expect(req.method).to.equal('DELETE');

    req.respond(200, {}, 'deleted');
    const response = await promise;
    expect(response.status).to.equal(200);
  });

  it('должен обработать ошибку onerror', async () => {
    const http = new HTTPTransport();
    const promise = http.get('/fail');

    await Promise.resolve();

    const req = requests[0];
    req.onerror();

    await promise
      .then(() => { throw new Error('Должен быть выброшен onerror'); })
      .catch((error) => {
        expect(error.message).to.equal('Network error');
      });
  });

  it('должен обработать ошибку ontimeout', async () => {
    const http = new HTTPTransport();
    const promise = http.get('/timeout');

    await Promise.resolve();

    const req = requests[0];
    req.ontimeout();

    await promise
      .then(() => { throw new Error('Должен быть выброшен ontimeout'); })
      .catch((error) => {
        expect(error.message).to.equal('Request timeout');
      });
  });

  it('должен обработать ошибку onabort', async () => {
    const http = new HTTPTransport();
    const promise = http.get('/abort');

    await Promise.resolve();

    const req = requests[0];
    req.onabort();

    await promise
      .then(() => { throw new Error('Должен быть выброшен onabort'); })
      .catch((error) => {
        expect(error.message).to.equal('Request aborted');
      });
  });
});
