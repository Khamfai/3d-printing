"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { FileUpload } from "@/components/upload/FileUpload";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { uploadAPI } from "@/services/upload.service";
import { useConfigStore } from "@/store/config-store";
import { useAuthStore } from "@/store/auth-store";

const ThreeViewer = dynamic(
  () => import("@/components/three/ThreeViewer").then((m) => ({ default: m.ThreeViewer })),
  { ssr: false, loading: () => <Skeleton className="w-full h-[400px] rounded-xl" /> }
);

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const setModel = useConfigStore((s) => s.setModel);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [modelId, setModelId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileFormat, setFileFormat] = useState("stl");

  const handleFileSelect = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "stl";
    setFileFormat(ext);

    // Create local preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    if (!isAuthenticated) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Get presigned URL
      const res = await uploadAPI.getPresignedUrl({
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
      });

      if (res.data) {
        setModelId(res.data.modelId);

        // Upload to R2
        await uploadAPI.uploadToPresignedUrl(res.data.uploadUrl, file, setUploadProgress);
        setUploadProgress(100);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleContinue = () => {
    if (modelId) {
      setModel(modelId, "Uploaded Model");
      router.push("/configure");
    }
  };

  return (
    <div className="container-page max-w-4xl">
      <PageHeader
        title="Upload 3D Model"
        description="Upload your 3D model file to preview and configure for printing"
      />

      {!isAuthenticated && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm text-yellow-800">
          Please <a href="/login" className="font-medium underline">sign in</a> to upload and order prints.
          You can still preview models locally.
        </div>
      )}

      <FileUpload
        onFileSelect={handleFileSelect}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
      />

      {previewUrl && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">3D Preview</h2>
          <ThreeViewer
            modelUrl={previewUrl}
            format={fileFormat}
            showDimensions
            onLoad={(dims) => {
              // Confirm upload with dimensions
              if (modelId) {
                uploadAPI.confirmUpload({
                  modelId,
                  dimensionX: dims.x,
                  dimensionY: dims.y,
                  dimensionZ: dims.z,
                }).catch(console.error);
              }
            }}
          />

          {modelId && (
            <Button onClick={handleContinue} size="lg" className="w-full sm:w-auto">
              Continue to Configure &rarr;
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
