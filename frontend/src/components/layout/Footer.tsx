import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="font-bold text-xl text-brand-600">Print3D</Link>
            <p className="mt-2 text-sm text-gray-500">
              Professional 3D printing service. Upload, configure, and order your prints online.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Services</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/gallery" className="hover:text-brand-600">Model Gallery</Link></li>
              <li><Link href="/upload" className="hover:text-brand-600">Upload Model</Link></li>
              <li><Link href="/gallery" className="hover:text-brand-600">Materials</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Account</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/login" className="hover:text-brand-600">Login</Link></li>
              <li><Link href="/register" className="hover:text-brand-600">Sign Up</Link></li>
              <li><Link href="/dashboard" className="hover:text-brand-600">Dashboard</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Support</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><span className="hover:text-brand-600">Contact Us</span></li>
              <li><span className="hover:text-brand-600">FAQ</span></li>
              <li><span className="hover:text-brand-600">Shipping Info</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Print3D. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
