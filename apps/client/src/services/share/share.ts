import type { ResumeDto } from "@reactive-resume/dto";

import { axios } from "@/client/libs/axios";

type CreateShareResponse = {
  id: string;
  shareToken: string;
  resumeId: string;
  ownerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ShareWithOwner = CreateShareResponse & {
  owner: {
    id: string;
    name: string;
    username: string;
  };
};

type SharedResumeResponse = {
  share: ShareWithOwner;
  resume: ResumeDto;
};

type OrderResponse = {
  id: string;
  outTradeNo: string;
  codeUrl: string;
  amount: number;
  status: string;
  createdAt: string;
};

type ShareAccessResponse = {
  hasAccess: boolean;
  accessType: "none" | "owner_paid" | "viewer_paid";
  remainingDownloads?: number;
};

export const createShare = async (data: { resumeId: string }) => {
  const response = await axios.post<CreateShareResponse>("/share", data);
  return response.data;
};

export const getResumeShares = async (resumeId: string) => {
  const response = await axios.get<CreateShareResponse[]>(`/share/resume/${resumeId}`);
  return response.data;
};

export const deactivateShare = async (shareId: string) => {
  const response = await axios.delete<ShareWithOwner>(`/share/${shareId}`);
  return response.data;
};

export const getSharedResume = async (shareToken: string) => {
  const response = await axios.get<SharedResumeResponse>(`/shared/${shareToken}`);
  return response.data;
};

// 分享支付相关API
export const createShareOrder = async (data: {
  shareToken: string;
  paymentType: "owner" | "viewer";
  userId?: string;
}) => {
  const response = await axios.post<OrderResponse>("/payment/create-share-order", data);
  return response.data;
};

export const checkShareAccess = async (shareToken: string) => {
  const response = await axios.get<ShareAccessResponse>(
    `/payment/check-share-access?shareToken=${shareToken}`,
  );
  return response.data;
};

export const recordShareDownload = async (data: { shareToken: string; downloaderId?: string }) => {
  const response = await axios.post<{ success: boolean }>("/payment/record-share-download", data);
  return response.data;
};
