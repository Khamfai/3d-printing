"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { modelsAPI } from "@/services/models.service";
import { useConfigStore } from "@/store/config-store";
import type { Model3D } from "@/types";

const ThreeViewer = dynamic(
  () => import("@/components/three/ThreeViewer").then((m) => ({ default: m.ThreeViewer })),
  { ssr: false, loading: () => <Skeleton className="w-full h-[400px] lg:h-[500px] rounded-xl" /> }
);

export default function ModelDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const setModel = useConfigStore((s) => s.setModel);
  const [model, setModelData] = useState<Model3D | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await modelsAPI.getBySlug(slug);
        if (res.data) setModelData(res.data);
      } catch {
        // Model not found
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [slug]);

  const handlePrintThis = () => {
    if (model) {
      setModel(model.id, model.name);
      router.push("/configure");
    }
  };

  if (isLoading) {
    return (
      <div className="container-page">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="w-full h-[500px] rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="container-page text-center py-20">
        <h1 className="text-2xl font-bold text-gray-900">Model Not Found</h1>
        <p className="text-gray-500 mt-2">The model you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/gallery"><Button className="mt-4">Back to Gallery</Button></Link>
      </div>
    );
  }

  return (
    <div className="container-page">
      <PageHeader title={model.name} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3D Viewer */}
        <div className="lg:col-span-2">
          <ThreeViewer
            modelUrl={model.fileUrl}
            format={model.format.toLowerCase()}
            showDimensions
          />
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{model.name}</h2>
                {model.description && (
                  <p className="text-sm text-gray-500 mt-2">{model.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Format</p>
                  <p className="font-medium">{model.format}</p>
                </div>
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-medium">{model.category || "General"}</p>
                </div>
                {model.dimensionX && (
                  <div className="col-span-2">
                    <p className="text-gray-500">Dimensions</p>
                    <p className="font-mono font-medium">
                      {model.dimensionX} x {model.dimensionY} x {model.dimensionZ} mm
                    </p>
                  </div>
                )}
                {model.volumeCm3 && (
                  <div>
                    <p className="text-gray-500">Volume</p>
                    <p className="font-medium">{model.volumeCm3} cm&sup3;</p>
                  </div>
                )}
              </div>

              <Button onClick={handlePrintThis} className="w-full" size="lg">
                Print This Model
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
