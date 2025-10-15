import { FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { motion } from "framer-motion";
import { useState } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    alert(`Subscribed with: ${email}`);
    setEmail("");
  };

  return (
    <footer className="bg-[var(--secondary-bg)] text-[var(--text-color)]">
      {/* Top Footer */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10"
      >
        {/* About */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-[var(--accent)]">About Us</h2>
          <p className="text-sm leading-relaxed">
            We are a passionate MERN development team delivering modern, scalable, and
            client-friendly solutions. With 30+ live projects, we aim to make every
            project impactful and result-driven.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-[var(--accent)]">Quick Links</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#home" className="hover:text-[var(--accent)] transition">Home</a></li>
            <li><a href="#about" className="hover:text-[var(--accent)] transition">About</a></li>
            <li><a href="#services" className="hover:text-[var(--accent)] transition">Services</a></li>
            <li><a href="#projects" className="hover:text-[var(--accent)] transition">Projects</a></li>
            <li><a href="#blog" className="hover:text-[var(--accent)] transition">Blog</a></li>
            <li><a href="#contact" className="hover:text-[var(--accent)] transition">Contact</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-[var(--accent)]">Contact Us</h2>
          <p className="flex items-center gap-2 text-sm">
            <FaMapMarkerAlt className="text-[var(--accent)]" /> 120 Mahamai Ka Bagh, Bhopal, India
          </p>
          <p className="flex items-center gap-2 text-sm">
            <FaPhoneAlt className="text-[var(--accent)]" /> +91 91114 61666
          </p>
          <p className="flex items-center gap-2 text-sm">
            <FaEnvelope className="text-[var(--accent)]" /> ashu.enterprises2@gmail.com
          </p>
          <div className="flex space-x-3 mt-4">
            {[
              { icon: <FaGithub />, link: "https://github.com" },
              { icon: <FaLinkedin />, link: "https://linkedin.com" },
              { icon: <FaTwitter />, link: "https://twitter.com" },
              { icon: <FaInstagram />, link: "https://instagram.com" }
            ].map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-[var(--accent)] text-white hover:scale-110 transition transform"
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-[var(--accent)]">Subscribe</h2>
          <p className="text-sm mb-4">Get the latest updates and offers directly to your inbox.</p>
          <form onSubmit={handleSubscribe} className="flex items-center bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--accent)]">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 text-sm bg-transparent outline-none text-[var(--text-color)]"
              required
            />
            <button
              type="submit"
              className="bg-[var(--accent)] px-4 py-2 text-white text-sm font-semibold hover:opacity-90"
            >
              Subscribe
            </button>
          </form>
        </div>
      </motion.div>

      {/* Bottom Footer */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-4 border-t border-gray-300 dark:border-gray-700">
        © {new Date().getFullYear()} Siddhant Sahu | All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
