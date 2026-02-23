import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedModels } from "@/components/home/FeaturedModels";
import { HowItWorks } from "@/components/home/HowItWorks";
import type { ApiResponse, Model3D } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function getFeaturedModels(): Promise<Model3D[]> {
  try {
    const res = await fetch(`${API_URL}/api/models/featured`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data: ApiResponse<Model3D[]> = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const models = await getFeaturedModels();

  return (
    <>
      <HeroSection />
      {models.length > 0 && <FeaturedModels models={models} />}
      <HowItWorks />

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Ready to Start Printing?</h2>
          <p className="mt-4 text-lg text-gray-500">
            Upload your 3D model and get an instant quote. High-quality prints shipped to your door.
          </p>
        </div>
      </section>
    </>
  );
}
