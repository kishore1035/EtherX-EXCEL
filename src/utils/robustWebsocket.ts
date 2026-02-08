/**
 * Robust WebSocket connection with exponential backoff
 */

export interface WebSocketCallbacks {
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onMessage?: (event: MessageEvent) => void;
  onError?: (event: Event) => void;
}

export interface WebSocketOptions extends WebSocketCallbacks {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
}

export interface RobustWebSocket {
  send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
  stop: () => void;
  getSocket: () => WebSocket | null;
}

export function createWebSocketWithBackoff(
  url: string,
  opts: WebSocketOptions = {}
): RobustWebSocket {
  const {
    maxAttempts = 8,
    initialDelay = 500,
    maxDelay = 8000,
    onOpen,
    onClose,
    onMessage,
    onError,
  } = opts;

  let socket: WebSocket | null = null;
  let attemptCount = 0;
  let reconnectTimeout: NodeJS.Timeout | null = null;
  let isStopped = false;
  let isConnected = false;

  function calculateDelay(attempt: number): number {
    const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
    return delay;
  }

  function connect() {
    if (isStopped || attemptCount >= maxAttempts) {
      return;
    }

    try {
      socket = new WebSocket(url);

      socket.addEventListener('open', (event) => {
        attemptCount = 0;
        isConnected = true;
        onOpen?.(event);
      });

      socket.addEventListener('close', (event) => {
        isConnected = false;
        onClose?.(event);

        if (!isStopped && attemptCount < maxAttempts) {
          const delay = calculateDelay(attemptCount);
          attemptCount++;
          
          reconnectTimeout = setTimeout(() => {
            connect();
          }, delay);
        }
      });

      socket.addEventListener('message', (event) => {
        onMessage?.(event);
      });

      socket.addEventListener('error', (event) => {
        onError?.(event);
      });
    } catch (error) {
      if (!isStopped && attemptCount < maxAttempts) {
        const delay = calculateDelay(attemptCount);
        attemptCount++;
        
        reconnectTimeout = setTimeout(() => {
          connect();
        }, delay);
      }
    }
  }

  // Initial connection
  connect();

  return {
    send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
      if (socket && isConnected && socket.readyState === WebSocket.OPEN) {
        socket.send(data);
      }
    },
    stop: () => {
      isStopped = true;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      if (socket) {
        socket.close();
        socket = null;
      }
      isConnected = false;
    },
    getSocket: () => socket,
  };
}
