import React from "react";
import GptSearchBar from "./GptSearchBar";
import { BG_URL } from "../Utils/constant";

const GPTSearch = () => {
  return (
    <div className="min-h-screen">
      <div className="fixed -z-10 w-full h-full">
        <img
          src={BG_URL}
          alt="background"
          className="w-full h-full object-cover"
        />
      </div>
      <GptSearchBar />
    </div>
  );
};

export default GPTSearch;
