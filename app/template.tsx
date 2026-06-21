"use client";

import { motion } from "framer-motion";
import React from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ x: 40, opacity: 0, filter: "blur(8px)" }} // पन्ना राइट से आ रहा है और धुंधला है
      animate={{ x: 0, opacity: 1, filter: "blur(0px)" }} // अपनी जगह पर आकर एकदम साफ़ हो गया
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 25, // यह बाउंस (झटके) को रोककर Google Books जैसी सॉफ्टनेस देगा
        mass: 0.5,
      }}
      // 🌟 PERFORMANCE HACK: यह ब्राउज़र को पहले ही बता देता है कि इसे एनिमेट होना है, जिससे स्लो डिवाइस भी लैग नहीं करते
      className="will-change-transform will-change-opacity will-change-filter" 
    >
      {children}
    </motion.div>
  );
}