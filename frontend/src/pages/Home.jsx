import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // For animations

// Import your components and assets
import { getHoardings } from "../api/api";
import HoardingCard from "../components/HoardingCard";
import HoardingMap from '../components/HoardingMap';
import mediaOwnerImage from '../assets/images/media-owner.jpeg';

// Framer Motion animation variants for reusability
const fadeInUp = {
  initial: { y: 40, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.7, ease: "easeOut" } }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

// Placeholder data for new sections
const testimonials = [
  { name: "Priya Sharma", company: "Marketing Head, Local Eatery", quote: "Using OOHBox was a game-changer for our launch. We saw a 40% increase in foot traffic. The platform is incredibly easy to use!", avatar: 'https://i.pravatar.cc/150?img=1' },
  { name: "Amit Singh", company: "Founder, Tech Startup", quote: "We reached thousands of potential customers in Mumbai within our budget. The transparency and analytics are top-notch.", avatar: 'https://i.pravatar.cc/150?img=3' },
  { name: "Sunita Reddy", company: "Real Estate Agent", quote: "Booking hoardings used to be a nightmare. OOHBox simplified the entire process. I booked three prime locations in under an hour.", avatar: 'https://i.pravatar.cc/150?img=5' },
];

const popularCities = ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad"];

// Reusable Icon component for "How It Works" section
const Icon = ({ path }) => (
  <div className="bg-blue-100 p-4 rounded-full mb-4">
    <svg className="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path}></path></svg>
  </div>
);

// Reusable Marquee component for the hero section background
const Marquee = ({ items, direction = 'normal', speed = 'normal' }) => {
  // Use tailwind.config.js animation 'marquee' and its variants
  const durationClass = speed === 'slow' ? 'animate-[marquee_60s_linear_infinite]' : 'animate-[marquee_45s_linear_infinite]';
  const directionClass = direction === 'reverse' ? 'reverse' : '';

  return (
    <div className="flex w-full overflow-hidden select-none">
      <div className={`flex flex-shrink-0 items-center whitespace-nowrap ${durationClass} ${directionClass}`}>
        {items.map((item, index) => <span key={index} className="px-6 text-2xl font-medium">{item} •</span>)}
      </div>
      {/* Duplicate the content to create a seamless loop */}
      <div className={`flex flex-shrink-0 items-center whitespace-nowrap ${durationClass} ${directionClass}`}>
        {items.map((item, index) => <span key={index} className="px-6 text-2xl font-medium">{item} •</span>)}
      </div>
    </div>
  );
};

// =================================================================================
// MAIN HOME COMPONENT
// =================================================================================
export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [city, setCity] = useState("");
  const [hoardings, setHoardings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all necessary data when the component mounts
    Promise.all([
      getHoardings({ limit: 6, status: "approved" }),
      getHoardings({ limit: 100, status: "approved" })
    ]).then(([featuredData, mapData]) => {
      setFeatured(featuredData.hoardings || []);
      setHoardings(mapData.hoardings || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (city) navigate(`/search?city=${city}`);
  };

  const handleCityClick = (selectedCity) => {
    navigate(`/search?city=${selectedCity}`);
  };

  return (
    <div className="bg-white text-gray-800">

      {/* ========== HERO SECTION with Dynamic Marquee Background ========== */}
      <motion.div initial="initial" animate="animate" variants={stagger} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gray-900 text-white">
        <div className="absolute inset-0 z-0 opacity-[0.15]">
          <div className="absolute top-[10%] w-full"><Marquee items={['Billboards', 'Hoardings', 'Digital OOH', 'Transit Ads', 'Metro Signs']} /></div>
          <div className="absolute top-[25%] w-full"><Marquee items={['Mumbai', 'Delhi', 'Pune', 'Bangalore', 'Hyderabad', 'Chennai']} direction="reverse" speed="slow" /></div>
          <div className="absolute top-[40%] w-full"><Marquee items={['High Traffic', 'Brand Awareness', 'Prime Locations', 'High ROI', 'Hyperlocal']} /></div>
          <div className="absolute top-[55%] w-full"><Marquee items={['Airports', 'Malls', 'Highways', 'Bus Shelters', 'Corporate Parks']} direction="reverse" /></div>
          <div className="absolute top-[70%] w-full"><Marquee items={['Instant Booking', 'Transparent Pricing', 'Campaign Analytics', '24/7 Support']} speed="slow" /></div>
          <div className="absolute top-[85%] w-full"><Marquee items={['Your Brand Here', 'Get Noticed', 'Reach Millions', 'Grow Your Business']} direction="reverse" /></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent z-10"></div>
        <div className="relative z-20 text-center px-4">
          <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-extrabold mb-4 text-shadow-lg">Your Brand. <span className="text-blue-400">Unmissable.</span></motion.h1>
          <motion.p variants={fadeInUp} className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-shadow">Find, book, and launch high-impact outdoor campaigns across India with unparalleled ease and transparency.</motion.p>
          <motion.form variants={fadeInUp} onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="flex rounded-md shadow-2xl">
              <input type="text" placeholder="Enter a city to start..." className="flex-grow px-5 py-4 rounded-l-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" value={city} onChange={(e) => setCity(e.target.value)} />
              <button type="submit" className="bg-blue-600 text-white px-8 py-4 rounded-r-md font-semibold hover:bg-blue-700 transition duration-300">Search</button>
            </div>
          </motion.form>
          <motion.div variants={fadeInUp} className="mt-6 flex flex-wrap gap-2 justify-center items-center">
            <span className="text-gray-300 text-sm mr-2">Popular:</span>
            {popularCities.map(c => <button key={c} onClick={() => handleCityClick(c)} className="bg-white/10 text-white text-sm px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm hover:bg-white/20 transition">{c}</button>)}
          </motion.div>
        </div>
      </motion.div>

      {/* Generic wrapper for all subsequent sections to apply scroll animations */}
      <motion.div initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.1 }} variants={stagger}>

        {/* ========== HOW IT WORKS SECTION ========== */}
        <motion.section
          variants={fadeInUp}
          className="py-16 md:py-24 bg-gray-50"
        >
          <div className="max-w-7xl mx-auto px-4 text-center">

            {/* Part 1: The "What & Why" - Educating the User */}
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
                Unlock the Power of Real-World Advertising
              </h2>
              <p className="text-lg text-gray-600 mb-12">
                Out-of-Home (OOH) advertising is about making your brand unmissable in the physical world. Think towering billboards on busy highways, vibrant digital screens in crowded malls, and clever ads at bus shelters. It’s about capturing attention, building massive brand trust, and reaching people where they live, work, and travel every single day.
              </p>
            </div>

            {/* Part 2: The "How" - The OOHBox Process */}
            <div className="mt-10">
              <h3 className="text-2xl font-semibold mb-12 text-gray-700">Here's How OOHBox Makes It Simple</h3>
              <div className="grid md:grid-cols-3 gap-10 lg:gap-16">

                {/* Step 1: Discover */}
                <div className="flex flex-col items-center">
                  <Icon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  <h4 className="text-xl font-bold mt-2 mb-2">1. Search & Discover</h4>
                  <p className="text-gray-600">
                    Explore India's largest network of hoardings and advertising spaces. Use powerful filters to find the perfect spot by city, location, traffic, and price.
                  </p>
                </div>

                {/* Step 2: Connect */}
                <div className="flex flex-col items-center">
                  <Icon path="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  <h4 className="text-xl font-bold mt-2 mb-2">2. Connect & Plan</h4>
                  <p className="text-gray-600">
                    Have questions? Our expert OOHBox team is here to help. We'll connect you directly with the media owner and provide data-driven advice for your campaign.
                  </p>
                </div>

                {/* Step 3: Book */}
                <div className="flex flex-col items-center">
                  <Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <h4 className="text-xl font-bold mt-2 mb-2">3. Book & Go Live</h4>
                  <p className="text-gray-600">
                    Once you're ready, book your spot securely through our transparent platform. Just upload your artwork and watch your brand go live!
                  </p>
                </div>

              </div>
            </div>

          </div>
        </motion.section>

        {/* ========== FEATURED HOARDINGS SECTION ========== */}
        <motion.section variants={fadeInUp} className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Prime Locations, Ready For You</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map((h) => <HoardingCard key={h._id} hoarding={h} />)}
            </div>
          </div>
        </motion.section>

        {/* ========== TESTIMONIALS SECTION ========== */}
        <motion.section variants={fadeInUp} className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Brands Across India</h2>
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">See what our partners have to say about their success.</p>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-white p-8 rounded-lg shadow-lg text-left border border-gray-100">
                  <img src={t.avatar} alt={t.name} className="w-16 h-16 rounded-full mb-4 border-2 border-blue-200" />
                  <p className="text-gray-600 mb-4 italic">"{t.quote}"</p>
                  <p className="font-bold text-gray-800">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.company}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ========== INTERACTIVE MAP SECTION ========== */}
        <motion.section variants={fadeInUp} className="bg-white py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Explore Our Nationwide Network</h2>
            <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto text-center">Use our interactive map to pinpoint the perfect spot for your brand's next big campaign.</p>
            {loading ? <div className="h-[550px] bg-gray-200 rounded-lg animate-pulse" /> : <HoardingMap hoardings={hoardings} />}
          </div>
        </motion.section>

        {/* ========== FOR MEDIA OWNERS SECTION ========== */}
        <motion.section variants={fadeInUp} className="py-16 md:py-24 bg-blue-50">
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Own an Ad Space?</h2>
              <p className="text-lg text-gray-700 mb-6">Maximize your revenue by listing your property on OOHBox. Reach thousands of potential advertisers, manage your bookings effortlessly, and get paid securely. It's free to list!</p>
              <button onClick={() => navigate('/list-your-property')} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-md text-lg hover:bg-blue-700 transition-all shadow-lg">List Your Property Today</button>
            </div>
            <div className="h-80 rounded-lg overflow-hidden shadow-xl">
              <img src={mediaOwnerImage} alt="Media owner managing properties" className="w-full h-full object-cover" />
            </div>
          </div>
        </motion.section>

      </motion.div>

    </div>
  );
}