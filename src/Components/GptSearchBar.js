import React, { useRef, useState } from "react";
import { useSelector } from "react-redux"; // For Redux state
import lang from "../Utils/languageConstants"; // Language constants
import { API_OPTIONS, GEMINI_KEY } from "../Utils/constant"; // API constants

const { GoogleGenerativeAI } = require("@google/generative-ai"); // Import Google Generative AI

const GptSearchBar = () => {
  const langkey = useSelector((store) => store.config.lang); // Get language key from Redux
  const searchText = useRef(null);
  const [movieResults, setMovieResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch movie details from TMDB API
  const searchMovieTMDB = async (movie) => {
    try {
      const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
        movie
      )}&include_adult=false&language=en-US&page=1`;
      console.log("Fetching from TMDB URL:", url);
      console.log("API Options:", API_OPTIONS);

      const response = await fetch(url, API_OPTIONS);

      if (!response.ok) {
        console.error(
          "TMDB Response not OK:",
          response.status,
          response.statusText
        );
        throw new Error(`TMDB API error: ${response.status}`);
      }

      const json = await response.json();
      console.log("TMDB API Response:", json);

      return json.results || [];
    } catch (error) {
      console.error("Error Fetching details from TMDB Movie database:", error);
      throw error;
    }
  };

  // Handle GPT search button click
  const handleGptSearchClick = async () => {
    if (!searchText.current.value.trim()) {
      setError("Please enter a search query");
      return;
    }

    setLoading(true);
    setError(null);
    setMovieResults([]);

    try {
      console.log("Searching for:", searchText.current.value);

      // Search directly from TMDB
      const searchQuery = searchText.current.value;
      const movieData = await searchMovieTMDB(searchQuery);

      console.log("Search Results count:", movieData.length);
      console.log("Search Results:", movieData);

      if (movieData.length === 0) {
        setError("No movies found. Try a different search.");
      } else {
        // Show all movies, even without posters
        setMovieResults(movieData);
      }
    } catch (error) {
      console.error("Error searching movies:", error);
      setError(error.message || "Failed to fetch movies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center pt-10">
      {/* Search bar */}
      <form
        className="w-full max-w-3xl bg-black grid grid-cols-12 mt-12"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          ref={searchText}
          type="text"
          className="p-4 m-4 col-span-9 text-white bg-gray-700 rounded-lg"
          placeholder={
            lang[langkey]?.gptSearchPlaceholder || "Search for a movie..."
          }
        />
        <button
          className="col-span-3 m-4 py-2 px-4 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:bg-gray-600"
          onClick={handleGptSearchClick}
          disabled={loading}
        >
          {loading ? "Searching..." : lang[langkey]?.search || "Search"}
        </button>
      </form>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-4 bg-red-600 text-white rounded-lg max-w-3xl">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="mt-6 text-white text-xl">
          🎬 Searching for movies...
        </div>
      )}

      {/* Movie results */}
      {!loading && movieResults.length > 0 && (
        <div className="mt-6 w-full px-4 z-10 relative max-h-[calc(100vh-200px)] overflow-y-auto">
          <h2 className="text-white text-2xl font-bold mb-4 text-center">
            Found {movieResults.length} Movies
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {movieResults.map((movie) => (
              <div
                key={movie.id}
                className="bg-gray-800 text-white p-2 rounded-lg w-48 mb-4 shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-72 object-cover rounded-lg mb-2"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/500x750?text=No+Image";
                  }}
                />
                <h3 className="text-center text-lg font-semibold mb-2 hover:text-red-500 line-clamp-2">
                  {movie.title}
                </h3>
                <p className="text-center text-sm text-gray-400">
                  ⭐ {movie.vote_average?.toFixed(1) || "N/A"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GptSearchBar;
