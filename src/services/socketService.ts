import { io, Socket } from "socket.io-client";

type CatalogListener = (data?: any) => void;
type CreditListener = (data: { creditBalance: number }) => void;

class SocketService {
  private socket: Socket | null = null;
  private catalogListeners = new Set<CatalogListener>();
  private creditListeners = new Set<CreditListener>();
  private authToken: string | null = null;

  connect() {
    if (this.socket) return this.socket;

    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
      auth: (cb) => cb({ token: this.authToken }), // read fresh on every (re)connect
    });

    this.socket.on("connect", () => console.log("✅ Socket connected"));
    this.socket.on("connect_error", (err) =>
      console.error("❌ Socket connection error:", err.message),
    );
    this.socket.on("disconnect", (reason) =>
      console.log("🔌 Socket disconnected:", reason),
    );

    const handleCatalogUpdate = (data?: any) => {
      this.catalogListeners.forEach((cb) => cb(data));
    };
    this.socket.on("catalog_updated", handleCatalogUpdate);
    this.socket.on("products_updated", handleCatalogUpdate);
    this.socket.on("packages_updated", handleCatalogUpdate);
    this.socket.on("packages_changed", handleCatalogUpdate);
    this.socket.on("package_status_changed", handleCatalogUpdate);

    this.socket.on("credit_balance_updated", (data) => {
      this.creditListeners.forEach((cb) => cb(data));
    });

    return this.socket;
  }

  // Call on login / logout / token change. Reconnects so the server re-authenticates.
  setAuthToken(token: string | null) {
    if (this.authToken === token) return;
    this.authToken = token;
    if (this.socket) {
      this.socket.disconnect();
      this.socket.connect();
    }
  }

  onCatalogUpdate(callback: CatalogListener): () => void {
    this.connect();
    this.catalogListeners.add(callback);
    return () => {
      this.catalogListeners.delete(callback);
    };
  }

  onCreditBalanceUpdate(callback: CreditListener): () => void {
    this.connect();
    this.creditListeners.add(callback);
    return () => {
      this.creditListeners.delete(callback);
    };
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.catalogListeners.clear();
    this.creditListeners.clear();
  }
}

const socketService = new SocketService();
export default socketService;