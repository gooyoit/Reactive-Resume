import { t } from "@lingui/macro";
import type {
  CheckDownloadLimitDto,
  CreateOrderDto,
  DownloadLimitResponseDto,
  OrderResponseDto,
} from "@reactive-resume/dto";
import { useMutation, useQuery } from "@tanstack/react-query";

import { toast } from "@/client/hooks/use-toast";
import { axios } from "@/client/libs/axios";

export const createPaymentOrder = async (data: CreateOrderDto): Promise<OrderResponseDto> => {
  const response = await axios.post<OrderResponseDto>("/payment/create-order", data);
  return response.data;
};

export const checkDownloadLimit = async (
  data: CheckDownloadLimitDto,
): Promise<DownloadLimitResponseDto> => {
  const response = await axios.get<DownloadLimitResponseDto>("/payment/check-download-limit", {
    params: data,
  });
  return response.data;
};

export const useCreatePaymentOrder = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: createOrder,
  } = useMutation({
    mutationFn: createPaymentOrder,
    onError: (error) => {
      const message = error.message;
      toast({
        variant: "error",
        title: t`Failed to create payment order`,
        description: message,
      });
    },
  });

  return { createOrder, loading, error };
};

export const checkOrderStatus = async (
  outTradeNo: string,
): Promise<{ status: string; transactionId?: string }> => {
  const response = await axios.get<{ status: string; transactionId?: string }>(
    "/payment/order-status",
    {
      params: { outTradeNo },
    },
  );
  return response.data;
};

export const useCheckDownloadLimit = (resumeId: string) => {
  return useQuery({
    queryKey: ["download-limit", resumeId],
    queryFn: () => checkDownloadLimit({ resumeId }),
    refetchOnWindowFocus: false,
  });
};
