import { Github, Twitter, Instagram, Linkedin, Phone, Mail, MapPin } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo light showText />
          <p className="mt-4 text-sm text-gray-400">
            Smart Healthcare Management System helps you connect with doctors, book appointments, and manage your health records easily.
          </p>
          <div className="mt-6 flex gap-3">
            {[Github, Twitter, Instagram, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-primary-500">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-semibold">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            {['Home', 'About Us', 'Services', 'Doctors', 'Contact Us'].map((item) => (
              <li key={item}><a href={`/#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-white">{item}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold">Services</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            {['Book Appointment', 'Find Doctors', 'Medical Records', 'AI Health Assistant'].map((item) => (
              <li key={item}><a href="/#services" className="hover:text-white">{item}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold">Contact Us</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91-8134033185</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> aburahat72@gmail.com</li>
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />NH 154, Bashdahar, Hailakandi, Assam, 788151</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-sm text-gray-500">
        © 2026 Smart Healthcare Management System. All rights reserved.
      </div>
    </footer>
  );
}
