import { io, Socket } from "socket.io-client";
type CatalogListener = (data?: any) => void;
 
class SocketService {
  private socket: Socket | null = null;
  private catalogListeners = new Set<CatalogListener>();
 
  connect() {
    if (this.socket) return this.socket;
 
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });
 
    this.socket.on("connect", () => {
      console.log("✅ Socket connected");
    });
 
    this.socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });
 
    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
    });
 
    const handleCatalogUpdate = (data?: any) => {
      this.catalogListeners.forEach((cb) => cb(data));
    };
 
    this.socket.on("catalog_updated", handleCatalogUpdate);
    this.socket.on("products_updated", handleCatalogUpdate);
    this.socket.on("packages_updated", handleCatalogUpdate);
    this.socket.on("packages_changed", handleCatalogUpdate);
    this.socket.on("package_status_changed", handleCatalogUpdate);
 
    return this.socket;
  }
 
  onCatalogUpdate(callback: CatalogListener): () => void {
    this.connect(); // lazily connect on first subscription
    this.catalogListeners.add(callback);
    return () => {
      this.catalogListeners.delete(callback);
    };
  }
 
  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.catalogListeners.clear();
  }
}
 
const socketService = new SocketService();
export default socketService;
 