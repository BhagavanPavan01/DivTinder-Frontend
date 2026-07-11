import React from "react";

const Footer = () => {
  return (
    <footer className="relative z-10 backdrop-blur-md bg-white/10 border-t border-white/20">

      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-10 text-white">

        {/* Logo + Description */}
        <div>
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            💻🚀 divTinder
          </h2>
          <p className="mt-4 text-white/80 leading-relaxed text-sm">
            Empowering developers to connect, collaborate, and build amazing things.
            Join the community to find your next coding partner or open source project coordinator!
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-lg mb-4 border-b border-white/20 pb-2 inline-block">App Navigation</h3>
          <ul className="space-y-3 text-white/80 text-sm">
            <li className="hover:text-yellow-300 transition cursor-pointer flex items-center gap-2"><span className="opacity-60 text-xs">▶</span> Explore Developers</li>
            <li className="hover:text-yellow-300 transition cursor-pointer flex items-center gap-2"><span className="opacity-60 text-xs">▶</span> Community Rules</li>
            <li className="hover:text-yellow-300 transition cursor-pointer flex items-center gap-2"><span className="opacity-60 text-xs">▶</span> Privacy Policy</li>
            <li className="hover:text-yellow-300 transition cursor-pointer flex items-center gap-2"><span className="opacity-60 text-xs">▶</span> Open Source</li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="font-semibold text-lg mb-4 border-b border-white/20 pb-2 inline-block">Developer Links</h3>
          <div className="flex flex-col gap-3 text-sm">
            <a href="https://github.com/BhagavanPavan01" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/80 hover:text-yellow-300 transition hover:translate-x-1 w-max">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              GitHub Repository
            </a>
            <a href="https://www.linkedin.com/in/bhagavan-pavan-227857253/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/80 hover:text-yellow-300 transition hover:translate-x-1 w-max">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              LinkedIn Connect
            </a>
            <a href="https://bhagavanpavan-portfolio.netlify.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/80 hover:text-yellow-300 transition hover:translate-x-1 w-max">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              Developer Portfolio
            </a>
          </div>
          <p className="mt-6 text-white/60 text-xs">
            Built by Bhagavan Pavan • © {new Date().getFullYear()} divTinder
          </p>
        </div>

      </div>

    </footer>
  );
};

export default Footer;
