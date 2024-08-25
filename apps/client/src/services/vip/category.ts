import { VipCategoryDto } from "@reactive-resume/dto";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

import { VIP_CATEGORY_KEY } from "@/client/constants/query-keys";
import { axios } from "@/client/libs/axios";

export const fetchVipCategories = async () => {
  const response = await axios.get<VipCategoryDto[], AxiosResponse<VipCategoryDto[]>>(
    "/categories",
  );

  return response.data;
};

export const useVipCategories = () => {
  const {
    error,
    isPending: loading,
    data: vipCategories,
  } = useQuery({
    queryKey: VIP_CATEGORY_KEY,
    queryFn: fetchVipCategories,
  });

  return { vipCategories, loading, error };
};
