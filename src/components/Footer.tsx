import Link from 'next/link'
import { Home, Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-nepal-red rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">कोठा Nepal</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Nepal&apos;s most trusted platform for finding rooms, flats, and flatmates.
              Simple, safe, and free to use.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-nepal-red transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-nepal-red transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-nepal-red transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/listings" className="hover:text-white transition-colors">Find Rooms</Link></li>
              <li><Link href="/listings?listingType=flat" className="hover:text-white transition-colors">Find Flats</Link></li>
              <li><Link href="/listings?listingType=roommate" className="hover:text-white transition-colors">Find Flatmates</Link></li>
              <li><Link href="/listings?listingType=pg" className="hover:text-white transition-colors">PG/Hostel</Link></li>
              <li><Link href="/listings/create" className="hover:text-white transition-colors">Post Your Ad</Link></li>
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h3 className="font-semibold text-white mb-4">Popular Cities</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/listings?city=kathmandu" className="hover:text-white transition-colors">Kathmandu</Link></li>
              <li><Link href="/listings?city=lalitpur" className="hover:text-white transition-colors">Lalitpur (Patan)</Link></li>
              <li><Link href="/listings?city=pokhara" className="hover:text-white transition-colors">Pokhara</Link></li>
              <li><Link href="/listings?city=bhaktapur" className="hover:text-white transition-colors">Bhaktapur</Link></li>
              <li><Link href="/listings?city=biratnagar" className="hover:text-white transition-colors">Biratnagar</Link></li>
              <li><Link href="/listings?city=bharatpur" className="hover:text-white transition-colors">Bharatpur</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-nepal-red flex-shrink-0" />
                <span>Thamel, Kathmandu<br />Nepal</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-nepal-red flex-shrink-0" />
                <a href="tel:+97701-4XXXXXX" className="hover:text-white transition-colors">+977 01-4XXXXXX</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-nepal-red flex-shrink-0" />
                <a href="mailto:hello@kothanepal.com" className="hover:text-white transition-colors">hello@kothanepal.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} कोठा Nepal. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/help" className="hover:text-white transition-colors">Help</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
