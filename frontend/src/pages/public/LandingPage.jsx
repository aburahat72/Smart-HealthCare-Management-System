import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ClipboardList, MessageSquare, Star, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import HeroSlider from '../../components/HeroSlider';
import api from '../../api/axios';
import { getDoctorImage, getDoctorName } from '../../utils/helpers';
import toast, { Toaster } from 'react-hot-toast';

const services = [
  { icon: Calendar, title: 'Book Appointment', desc: 'Easily book appointments with your preferred doctors.' },
  { icon: User, title: 'Find Doctors', desc: 'Search and connect with qualified and experienced doctors.' },
  { icon: ClipboardList, title: 'Medical Records', desc: 'Access and manage your medical records securely.' },
  { icon: MessageSquare, title: 'AI Health Assistant', desc: 'Get AI-powered health suggestions based on your symptoms.' },
];

const DEFAULT_HERO = {
  title: 'Your Health, Our Priority',
  description: 'Smart Healthcare Management System helps you connect with doctors, book appointments, and manage your health records easily.',
};

export default function LandingPage() {
  const [doctors, setDoctors] = useState([]);
  const [contact, setContact] = useState({ name: '', email: '', message: '' });
  const [heroSlides, setHeroSlides] = useState([]);
  const [slideInterval, setSlideInterval] = useState(5);
  const [activeSlide, setActiveSlide] = useState(DEFAULT_HERO);
  const [doctorSlide, setDoctorSlide] = useState(0);

  useEffect(() => {
    api.get('/doctors/featured').then((res) => setDoctors(res.data)).catch(() => {});
    api.get('/hero').then((res) => {
      setHeroSlides(res.data.slides);
      setSlideInterval(res.data.slideInterval);
      if (res.data.slides?.[0]) setActiveSlide(res.data.slides[0]);
    }).catch(() => {});
  }, []);

  const handleSlideChange = useCallback((slide) => {
    if (slide) setActiveSlide(slide);
  }, []);

  const handleContact = (e) => {
    e.preventDefault();
    toast.success('Message sent successfully! We will get back to you soon.');
    setContact({ name: '', email: '', message: '' });
  };

  const hasDoctorCarousel = doctors.length > 4;
  const visibleDoctors = hasDoctorCarousel
    ? doctors.slice(doctorSlide, doctorSlide + 4).concat(doctors.slice(0, Math.max(0, doctorSlide + 4 - doctors.length)))
    : doctors;

  const moveDoctorSlide = (direction) => {
    setDoctorSlide((current) => (current + direction + doctors.length) % doctors.length);
  };

  const doctorCard = (doc) => (
    <div key={doc._id} className="card text-center">
      <img src={getDoctorImage(doc)} alt="" className="mx-auto h-24 w-24 rounded-full object-cover" />
      <h3 className="mt-4 font-bold text-gray-900">{getDoctorName(doc)}</h3>
      <p className="text-sm text-primary-500">{doc.specialization}</p>
      <div className="mt-2 flex items-center justify-center gap-1 text-sm text-yellow-500">
        <Star className="h-4 w-4 fill-current" /> {doc.rating?.toFixed(1)} ({doc.reviewCount} reviews)
      </div>
      <p className="mt-2 text-sm text-gray-500">{doc.experience}+ Years Experience</p>
      <p className="mt-1 font-bold text-green-600">₹{doc.consultationFee}</p>
      <Link to="/register" className="btn-primary mt-4 w-full py-2 text-xs">Book Appointment</Link>
    </div>
  );

  const renderHeroTitle = () => {
    const title = activeSlide.title || DEFAULT_HERO.title;
    if (title.includes(',')) {
      const [part1, part2] = title.split(',').map((s) => s.trim());
      return <>{part1}, <span className="text-primary-500">{part2}</span></>;
    }
    const words = title.split(' ');
    if (words.length <= 2) return title;
    const mid = Math.ceil(words.length / 2);
    return <>{words.slice(0, mid).join(' ')} <span className="text-primary-500">{words.slice(mid).join(' ')}</span></>;
  };

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />
      <Navbar />

      {/* Hero — design unchanged, image area now dynamic slider */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <span className="inline-block rounded-full bg-primary-100 px-4 py-1.5 text-xs font-bold tracking-wider text-primary-500">
              WELCOME TO SMART HEALTHCARE
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight text-gray-900 transition-all duration-500 lg:text-5xl xl:text-6xl">
              {renderHeroTitle()}
            </h1>
            <p className="mt-6 text-lg text-gray-500 transition-all duration-500">
              {activeSlide.description || DEFAULT_HERO.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary"><Calendar className="h-4 w-4" /> Book Appointment</Link>
              <a href="#doctors" className="btn-outline"><User className="h-4 w-4" /> View Doctors</a>
            </div>
          </div>
          <HeroSlider slides={heroSlides} slideInterval={slideInterval} onSlideChange={handleSlideChange} />
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <span className="text-xs font-bold tracking-wider text-primary-500">ABOUT US</span>
          <h2 className="mt-2 text-3xl font-bold text-gray-900 lg:text-4xl">Trusted Healthcare Platform</h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded bg-primary-500" />
          <p className="mx-auto mt-6 max-w-3xl text-gray-500">
            We provide a comprehensive healthcare management solution connecting patients with qualified doctors.
            Our platform offers appointment booking, medical records management, and AI-powered health assistance.
          </p>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold tracking-wider text-primary-500">OUR SERVICES</span>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">What We Offer</h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded bg-primary-500" />
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <div key={s.title} className="card group text-center transition hover:-translate-y-1 hover:shadow-lg">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 transition group-hover:bg-primary-500 group-hover:text-white">
                  <s.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-4 font-bold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section id="doctors" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold tracking-wider text-primary-500">OUR DOCTORS</span>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">Featured Doctors</h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded bg-primary-500" />
          </div>
          <div className="mt-12">
            {hasDoctorCarousel && (
              <div className="mb-4 flex justify-end gap-2">
                <button onClick={() => moveDoctorSlide(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-primary-200 hover:text-primary-500" aria-label="Previous doctors">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={() => moveDoctorSlide(1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-primary-200 hover:text-primary-500" aria-label="Next doctors">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {visibleDoctors.map(doctorCard)}
            </div>
            {hasDoctorCarousel && (
              <div className="mt-6 flex justify-center gap-2">
                {doctors.map((doc, index) => (
                  <button
                    key={doc._id}
                    onClick={() => setDoctorSlide(index)}
                    className={`h-2 rounded-full transition-all ${index === doctorSlide ? 'w-6 bg-primary-500' : 'w-2 bg-gray-300 hover:bg-primary-300'}`}
                    aria-label={`Show doctor ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold tracking-wider text-primary-500">CONTACT US</span>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">Get In Touch</h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded bg-primary-500" />
          </div>
          <form onSubmit={handleContact} className="card mt-10 space-y-4">
            <input className="input-field" placeholder="Your Name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} required />
            <input className="input-field" type="email" placeholder="Your Email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} required />
            <textarea className="input-field min-h-[120px]" placeholder="Your Message" value={contact.message} onChange={(e) => setContact({ ...contact, message: e.target.value })} required />
            <button type="submit" className="btn-primary w-full"><Send className="h-4 w-4" /> Send Message</button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
