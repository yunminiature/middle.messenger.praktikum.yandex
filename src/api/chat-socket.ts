export class ChatSocket {
  private ws: WebSocket | null = null;

  private pingInterval: number | null = null;

  private onOpen: (() => void) | null = null;

  private onMessage: ((data: unknown) => void) | null = null;

  private onClose: (() => void) | null = null;

  private onError: ((e: Event) => void) | null = null;

  constructor(userId: number, chatId: number, token: string, events?: {
    onOpen?: () => void;
    onMessage?: (data: unknown) => void;
    onClose?: () => void;
    onError?: (e: Event) => void;
  }) {
    if (events) {
      this.onOpen = events.onOpen || null;
      this.onMessage = events.onMessage || null;
      this.onClose = events.onClose || null;
      this.onError = events.onError || null;
    }

    this.connect(userId, chatId, token);
  }

  connect(userId: number, chatId: number, token: string) {
    this.ws = new WebSocket(`wss://ya-praktikum.tech/ws/chats/${userId}/${chatId}/${token}`);

    this.ws.addEventListener('open', () => {
      if (this.onOpen) this.onOpen();

      this.pingInterval = window.setInterval(() => {
        this.send({ type: 'ping' });
      }, 30000);

      this.send({ type: 'get old', content: '0' });
    });

    this.ws.addEventListener('message', (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        data = event.data;
      }
      if (this.onMessage) this.onMessage(data);
    });

    this.ws.addEventListener('close', () => {
      if (this.onClose) this.onClose();
      if (this.pingInterval) clearInterval(this.pingInterval);
    });

    this.ws.addEventListener('error', (event) => {
      if (this.onError) this.onError(event);
      if (this.pingInterval) clearInterval(this.pingInterval);
    });
  }

  send(data: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}
