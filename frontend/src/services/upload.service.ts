import { api } from "@/lib/api";
import type { ApiResponse, Model3D } from "@/types";

export const uploadAPI = {
  getPresignedUrl: (data: { fileName: string; fileType: string; fileSize: number }) =>
    api.post<ApiResponse<{ uploadUrl: string; key: string; modelId: string }>>(
      "/api/upload/presigned-url",
      data
    ),

  confirmUpload: (data: {
    modelId: string;
    dimensionX?: number;
    dimensionY?: number;
    dimensionZ?: number;
    volumeCm3?: number;
  }) => api.post<ApiResponse<Model3D>>("/api/upload/confirm", data),

  uploadToPresignedUrl: async (url: string, file: File, onProgress?: (percent: number) => void) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload failed: ${xhr.status}`));
      };

      xhr.onerror = () => reject(new Error("Upload failed"));
      xhr.send(file);
    });
  },
};
