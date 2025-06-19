import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// =========== HELPER COMPONENTS ===========

// Reusable Icon component for feature sections
const FeatureIcon = ({ children, className }) => (
  <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center ${className}`}>
    {children}
  </div>
);

// Icon for SVG paths
const Icon = ({ path, className = "w-8 h-8 text-white" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path}></path>
  </svg>
);

// FAQ Item with accordion functionality
const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="border-b border-gray-200 py-6">
      <dt>
        <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left text-gray-700">
          <span className="text-lg font-medium">{question}</span>
          <span className="ml-6 h-7 flex items-center">
            <svg className={`h-6 w-6 transform transition-transform ${isOpen ? '-rotate-180' : 'rotate-0'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>
      </dt>
      <motion.dd
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0, marginTop: isOpen ? '1rem' : 0 }}
        className="overflow-hidden"
      >
        <p className="text-base text-gray-600">{answer}</p>
      </motion.dd>
    </div>
  );
};


// =========== MAIN PAGE COMPONENT ===========

export default function ForMediaOwnersPage() {
  const navigate = useNavigate();

  // Animation variants for Framer Motion
  const fadeInUp = {
    initial: { y: 60, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.7, ease: "easeOut" } }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const handleRegisterClick = () => {
    // This will navigate to the vendor registration page.
    // Ensure you have a route like '/register/vendor' set up in your app's router.
    navigate('/register');
  };

  return (
    <div className="bg-white text-gray-800">
      {/* ========== HERO SECTION ========== */}
      <motion.section
        initial="initial"
        animate="animate"
        variants={stagger}
        className="bg-gray-900 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Stop Selling Ad Space.
            <br />
            <span className="text-blue-400">Start Maximizing Asset Yield.</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-gray-300">
            Your hoardings are high-value assets, not just commodities. The traditional, manual process is costing you money and peace of mind. It's time to upgrade your entire business model with OOHBox.
          </motion.p>
        </div>
      </motion.section>

      {/* ========== THE OLD WAY vs. THE OOHBOX WAY ========== */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">From Manual Chaos to Automated Control</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">The traditional OOH workflow is a bottleneck. OOHBox replaces it with a streamlined, digital-first approach.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* The Old Way */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-red-200">
              <h3 className="text-2xl font-bold text-red-600 mb-4">The Old, Manual Way</h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start"><span className="text-red-500 font-bold mr-3">✗</span> Relying on a limited network of brokers and inconsistent cold calls.</li>
                <li className="flex items-start"><span className="text-red-500 font-bold mr-3">✗</span> A slow back-and-forth of emails for manual Release Order (RO) generation.</li>
                <li className="flex items-start"><span className="text-red-500 font-bold mr-3">✗</span> Cumbersome proof-of-display process using photos with newspapers.</li>
                <li className="flex items-start"><span className="text-red-500 font-bold mr-3">✗</span> Little to no performance data to share with advertisers.</li>
                <li className="flex items-start"><span className="text-red-500 font-bold mr-3">✗</span> Chasing invoices and dealing with unpredictable cash flow.</li>
              </ul>
            </div>
            {/* The OOHBox Way */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-green-200">
              <h3 className="text-2xl font-bold text-green-600 mb-4">The New, OOHBox Way</h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start"><span className="text-green-500 font-bold mr-3">✓</span> Your inventory is showcased 24/7 to a nationwide network of verified advertisers.</li>
                <li className="flex items-start"><span className="text-green-500 font-bold mr-3">✓</span> Receive standardized booking requests to your dashboard. **Accept or Reject** with a click.</li>
                <li className="flex items-start"><span className="text-green-500 font-bold mr-3">✓</span> Transparent, digital record of campaigns builds advertiser trust and eliminates disputes.</li>
                <li className="flex items-start"><span className="text-green-500 font-bold mr-3">✓</span> Empower advertisers with real-time analytics on impressions, reach, and audience.</li>
                <li className="flex items-start"><span className="text-green-500 font-bold mr-3">✓</span> Guaranteed and on-time payments, secured upfront before the campaign begins.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>


      {/* ========== CORE BENEFITS SECTION ========== */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">The Business Upgrade You've Been Waiting For</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">OOHBox is more than a platform; it's a powerful tool for yield management, designed to extract the maximum financial return from your assets.</p>
          </div>
          <motion.div variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {/* Benefit 1 */}
            <motion.div variants={fadeInUp} className="bg-gray-50 p-8 rounded-lg">
                <FeatureIcon className="bg-blue-600"><Icon path="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></FeatureIcon>
                <h3 className="mt-4 text-xl font-bold">Maximize Your Asset Utilization</h3>
                <p className="mt-2 text-gray-600">An empty hoarding is a non-performing asset. Our platform works 24/7 to connect your inventory to a constant stream of demand, reducing costly vacancies and turning underutilized sites into consistent revenue generators.</p>
            </motion.div>
             {/* Benefit 2 */}
            <motion.div variants={fadeInUp} className="bg-gray-50 p-8 rounded-lg">
                <FeatureIcon className="bg-blue-600"><Icon path="M9 8h6m-5 4h4m5 4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2z" /></FeatureIcon>
                <h3 className="mt-4 text-xl font-bold">Command the Price You Deserve</h3>
                <p className="mt-2 text-gray-600">Escape the downward spiral of price undercutting. With OOHBox, you have the final say on every booking. By creating a competitive environment for your sites, we empower you to secure bookings based on true market value.</p>
            </motion.div>
             {/* Benefit 3 */}
            <motion.div variants={fadeInUp} className="bg-gray-50 p-8 rounded-lg">
                <FeatureIcon className="bg-blue-600"><Icon path="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><Icon path="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></FeatureIcon>
                <h3 className="mt-4 text-xl font-bold">Lower Your Cost of Sales</h3>
                <p className="mt-2 text-gray-600">Dramatically reduce the time, effort, and manpower required to find, negotiate with, and manage clients. This operational efficiency drops straight to your bottom line, increasing the profitability of every single booking.</p>
            </motion.div>
             {/* Benefit 4 */}
            <motion.div variants={fadeInUp} className="bg-gray-50 p-8 rounded-lg">
                <FeatureIcon className="bg-blue-600"><Icon path="M13 10V3L4 14h7v7l9-11h-7z" /></FeatureIcon>
                <h3 className="mt-4 text-xl font-bold">Future-Proof Your Business</h3>
                <p className="mt-2 text-gray-600">The future is programmatic. OOHBox is your simple gateway to this lucrative ecosystem. List your digital screens to sell inventory via automated, real-time bidding to a new wave of digital-first advertisers, without any technical expertise required.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========== FAQ SECTION ========== */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl md:text-4xl font-bold tracking-tight mb-12">Your Questions, Answered</h2>
            <dl className="space-y-4">
              <FaqItem
                question="Is it really free to list my properties on OOHBox?"
                answer="Yes, absolutely. There are no sign-up fees or charges to list your media assets on our platform. Our success is tied directly to your success—we earn only when you secure a booking through the platform."
              />
              <FaqItem
                question="Do I lose control over my pricing and who advertises on my sites?"
                answer="Never. You have 100% control. You set your terms and have the final say on every booking request you receive. You are free to accept or reject any offer based on your business needs and brand standards."
              />
               <FaqItem
                question="Is this platform only for large media owners with many sites?"
                answer="No. OOHBox is designed to empower everyone. We level the playing field, giving individual owners of a single high-value hoarding the same visibility and tools as large networks spanning multiple cities."
              />
              <FaqItem
                question="What if I only have traditional, non-digital hoardings?"
                answer="You are in the perfect place. While we are built for the future, the demand for traditional static billboards is massive. Our platform will connect you to a huge pool of advertisers looking for the powerful, unskippable impact that only your sites can provide."
              />
              <FaqItem
                question="How does OOHBox help me with regulatory compliance?"
                answer="While we don't file permits for you, our platform automates the entire sales and client management workflow. This frees up dozens of hours of your time, allowing you to focus your valuable resources on ensuring your sites are 100% compliant with local municipal regulations and safety standards."
              />
            </dl>
        </div>
      </section>

      {/* ========== FINAL CALL TO ACTION ========== */}
      <section className="bg-blue-600">
        <div className="max-w-4xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to Upgrade Your Business Model?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-100">
            Join the future of Out-of-Home advertising in India. Turn your prime locations into premium, high-earning assets with OOHBox. Listing is free, the opportunity is immense.
          </p>
          <button
            onClick={handleRegisterClick}
            className="mt-8 w-full inline-flex items-center justify-center px-8 py-4 border border-transparent rounded-md shadow-sm text-base font-medium text-blue-600 bg-white hover:bg-blue-50 sm:w-auto transition-transform transform hover:scale-105"
          >
            register as a vendor to list your media on oohbox
          </button>
        </div>
      </section>
    </div>
  );
}