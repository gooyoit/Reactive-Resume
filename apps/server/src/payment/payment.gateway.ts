import { Logger } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

type PaymentStatusUpdate = {
  outTradeNo: string;
  status: "pending" | "paid" | "cancelled" | "refunded";
  transactionId?: string;
};

@WebSocketGateway({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  namespace: "/payment",
})
export class PaymentGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PaymentGateway.name);

  // 存储订单号到socket的映射
  private readonly orderSocketMap = new Map<string, string>();
  // 存储socket ID到用户ID的映射
  private readonly socketUserMap = new Map<string, string>();

  afterInit(_server: Server) {
    this.logger.log("WebSocket Gateway initialized");
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // 清理映射关系
    this.socketUserMap.delete(client.id);

    // 清理订单映射
    for (const [outTradeNo, socketId] of this.orderSocketMap.entries()) {
      if (socketId === client.id) {
        this.orderSocketMap.delete(outTradeNo);
      }
    }
  }

  @SubscribeMessage("join_payment_room")
  handleJoinPaymentRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { outTradeNo: string; userId: string },
  ) {
    const { outTradeNo, userId } = data;
    this.logger.log(`User ${userId} joined payment room for order ${outTradeNo}`);
    // 建立映射关系
    this.orderSocketMap.set(outTradeNo, client.id);
    this.socketUserMap.set(client.id, userId);

    // 加入房间
    void client.join(`payment:${outTradeNo}`);

    // 发送确认消息
    client.emit("payment_room_joined", { outTradeNo });
  }

  @SubscribeMessage("leave_payment_room")
  handleLeavePaymentRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { outTradeNo: string },
  ) {
    const { outTradeNo } = data;

    this.logger.log(`Client ${client.id} left payment room for order ${outTradeNo}`);

    // 离开房间
    void client.leave(`payment:${outTradeNo}`);

    // 清理映射
    this.orderSocketMap.delete(outTradeNo);
  }

  // 供PaymentService调用，通知支付状态变更
  notifyPaymentStatusUpdate(update: PaymentStatusUpdate) {
    const { outTradeNo, status, transactionId } = update;

    this.logger.log(`Broadcasting payment status update for order ${outTradeNo}: ${status}`);

    // 向特定订单房间广播状态更新
    this.server.to(`payment:${outTradeNo}`).emit("payment_status_update", {
      outTradeNo,
      status,
      transactionId,
      timestamp: new Date(),
    });
  }

  // 检查订单是否有活跃的监听者
  hasActiveListeners(outTradeNo: string): boolean {
    return this.orderSocketMap.has(outTradeNo);
  }
}
