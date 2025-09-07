import type { ResumeDto } from "@reactive-resume/dto";

import { axios } from "@/client/libs/axios";

export const findResumeById = async (data: { id: string }) => {
  const response = await axios.get<ResumeDto>(`/resume/${data.id}`);

  return response.data;
};

export const findResumeByUsernameSlug = async (data: { username: string; slug: string }) => {
  // Multi-layered cache busting for Safari
  const cacheBuster = Date.now();
  const randomSalt = Math.random().toString(36).slice(2, 15);

  const response = await axios.get<ResumeDto>(
    `/resume/public/${data.username}/${data.slug}?_t=${cacheBuster}&_r=${randomSalt}`,
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
        // Safari-specific headers
        "If-Modified-Since": "0",
        "If-None-Match": "",
        // Force fresh request
        "X-Requested-With": "XMLHttpRequest",
        "X-Cache-Bust": `${cacheBuster}-${randomSalt}`,
      },
    },
  );

  return response.data;
};
