//src/pages/PlayerNamePage.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import UsernameForm from "@/components/UserNameForm";

function PlayerNamePage() {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem("playerName", name); // Store name for later use
      navigate("/stocks"); // Navigate to the stock selection page
    }
  };

  return (
    <motion.div
      className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <h1 className="text-2xl mb-4">Enter Your Name</h1>
      <UsernameForm />

    </motion.div>
  );
}

export default PlayerNamePage;
