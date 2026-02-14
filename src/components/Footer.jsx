import React from "react";

const Footer = () => {
  return (
    <footer className="relative z-10 backdrop-blur-md bg-white/10 border-t">

      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-10 text-white">

        {/* Logo + Description */}
        <div>
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            💘🔥 divTinder
          </h2>
          <p className="mt-4 text-white/80">
            Connecting hearts through meaningful matches.
            Find love, friendship, or your next coding partner.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
          <ul className="space-y-2 text-white/80">
            <li className="hover:text-yellow-300 transition cursor-pointer">Explore</li>
            <li className="hover:text-yellow-300 transition cursor-pointer">About</li>
            <li className="hover:text-yellow-300 transition cursor-pointer">Privacy Policy</li>
            <li className="hover:text-yellow-300 transition cursor-pointer">Terms of Service</li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Connect</h3>
          <div className="flex gap-4">
            <span className="hover:scale-110 transition transform cursor-pointer">💖</span>
            <span className="hover:scale-110 transition transform cursor-pointer">🔥</span>
            <span className="hover:scale-110 transition transform cursor-pointer">✨</span>
          </div>
          <p className="mt-4 text-white/60 text-sm">
            © {new Date().getFullYear()} divTinder. All rights reserved.
          </p>
        </div>

      </div>

    </footer>
  );
};

export default Footer;
