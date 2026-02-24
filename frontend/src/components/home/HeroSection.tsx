import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-brand-600 via-brand-700 to-brand-900 text-white">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 25% 50%, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Bring Your Ideas
            <span className="block text-brand-200">to Life in 3D</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-brand-100 max-w-2xl">
            Upload your 3D model, choose materials and settings, get an instant quote,
            and receive your professional-quality print delivered to your door.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/upload">
              <Button size="lg" className="bg-white text-brand-700 hover:bg-brand-50 focus:ring-3 focus:ring-white">
                Upload Your Model
              </Button>
            </Link>
            <Link href="/gallery">
              <Button size="lg" variant="outline" className="border-brand-300 bg-transparent text-white hover:bg-brand-600">
                Browse Gallery
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-8 border-t border-brand-500/30 pt-8">
            <div>
              <p className="text-3xl font-bold">5+</p>
              <p className="text-sm text-brand-200 mt-1">Materials</p>
            </div>
            <div>
              <p className="text-3xl font-bold">0.1mm</p>
              <p className="text-sm text-brand-200 mt-1">Min Layer Height</p>
            </div>
            <div>
              <p className="text-3xl font-bold">100MB</p>
              <p className="text-sm text-brand-200 mt-1">Max File Size</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
