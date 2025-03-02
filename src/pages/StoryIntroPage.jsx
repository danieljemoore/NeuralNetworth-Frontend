//src/pages/StoryIntroPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const storyTexts = [
  "In a world of high stakes and fast trades...",
  "You are about to enter the Neural Networth Market...",
  "Will you rise to the top or lose it all?",
];

function StoryIntroPage() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (index < storyTexts.length - 1) {
      setTimeout(() => setIndex(index + 1), 3000); // Change text every 3s
    } else {
      setTimeout(() => navigate("/name"), 3000); // Move to next page
    }
  }, [index, navigate]);

  return (
    <div className="flex h-screen justify-center items-center bg-black text-white text-xl p-4">
      <motion.p
        key={index}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 2 }}
        className="text-center"
      >
        {storyTexts[index]}
      </motion.p>
    </div>
  );
}

export default StoryIntroPage;
