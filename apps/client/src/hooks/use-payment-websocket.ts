import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

type PaymentStatusUpdate = {
  outTradeNo: string;
  status: "pending" | "paid" | "cancelled" | "refunded";
  transactionId?: string;
  timestamp: Date;
};

type UsePaymentWebSocketProps = {
  outTradeNo: string | null;
  userId: string;
  onPaymentSuccess?: (update: PaymentStatusUpdate) => void;
  onPaymentFailed?: (update: PaymentStatusUpdate) => void;
};

export const usePaymentWebSocket = ({
  outTradeNo,
  userId,
  onPaymentSuccess,
  onPaymentFailed,
}: UsePaymentWebSocketProps) => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!outTradeNo || !userId) {
      return;
    }

    // 创建 WebSocket 连接
    const socket = io(`${window.location.origin}/payment`, {
      transports: ["websocket", "polling"],
      timeout: 5000,
    });

    socketRef.current = socket;

    // 连接成功
    socket.on("connect", () => {
      setConnected(true);

      // 加入支付房间
      socket.emit("join_payment_room", {
        outTradeNo,
        userId,
      });
    });

    // 连接断开
    socket.on("disconnect", () => {
      setConnected(false);
    });

    // 连接错误
    socket.on("connect_error", () => {
      setConnected(false);
    });

    // 支付状态更新
    socket.on("payment_status_update", (update: PaymentStatusUpdate) => {
      if (update.status === "paid") {
        onPaymentSuccess?.(update);
      } else if (update.status === "cancelled" || update.status === "refunded") {
        onPaymentFailed?.(update);
      }
    });

    return () => {
      // 离开房间
      if (outTradeNo) {
        socket.emit("leave_payment_room", { outTradeNo });
      }

      // 断开连接
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [outTradeNo, userId, onPaymentSuccess, onPaymentFailed]);

  return {
    connected,
    socket: socketRef.current,
  };
};
