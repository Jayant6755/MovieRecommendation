import { useState } from "react";
import type { ChangeEvent } from "react";
import axios from "axios";

import {
  Card,
  CardContent,
  CardDescription,
  
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


interface Movie {
  title: string;
  year: string;
  director: string;
  genre: string;
  reason: string;
}

interface ApiResponse {
  success: boolean;
  recommendations: Movie[];
  message?: string;
}

function App() {
  const [userInput, setUserInput] = useState<string>("");
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = async () => {
    if (!userInput.trim()) {
      setError("Please enter your movie preferences");
      return;
    }


    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const res = await axios.post<ApiResponse>(
        "https://movierecommendation-1-n3x0.onrender.com/api/recommend",
        { userInput: userInput.trim().toLowerCase() }
      );
      console.log(userInput);

      if (res.data.success) {
        setRecommendations(res.data.recommendations);
      } else {
        setError("Failed to get recommendations");
      }
    } catch (err: any) {
      console.error("Error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to get recommendations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  //save recommendations to database
  const saveRecommendations = async () => {
    try {
      
      const res = await axios.post<ApiResponse>("https://movierecommendation-1-n3x0.onrender.com/api/save",{ userInput: userInput.trim().toLowerCase(), recommendations: recommendations }
      );
      
      if (res.data.success) {
        alert("Recommendations saved successfully!");
      } else {
        alert("Failed to save recommendations.");
      }
    } catch (err: any) {
      console.error("Save Error:", err);
      alert(
        err.response?.data?.message ||
          "Failed to save recommendations. Please try again."
      );
    }
  };
  

 
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setUserInput(e.target.value);

  return (
    <div className="h-auto min-h-screen lg:h-300 bg-black/90 flex flex-col items-center p-6 text-white ">
      <h1 className="text-2xl md:lg:text-6xl font-bold mb-2 text-center w-100 md:lg:w-130 font-serif">Find Your Next Favourite Film</h1>
      <p className="text-center mb-6 md:lg:w-110 justify-center items-center flex mt-5 font-sans">Tell us what you are in the mood for and we'll recommend movies that match your preferences!</p>
      {/* Search Box */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl mb-6 mt-5">
        <input
          type="text"
          placeholder="e.g., I love sci-fi movies with time travel..."
          value={userInput}
          onChange={handleChange}
          
          disabled={loading}
          className="flex-1 p-3 rounded-lg border-2 border-white/30 bg-white/10 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition"
        />
        <button
          onClick={getRecommendations}
          disabled={loading || !userInput.trim()}
          className="bg-white text-purple-700 font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Getting Recommendations..." : "Get Recommendations"}
        </button>

        <button 
          onClick={() => {
           saveRecommendations();
          }}
          className="bg-white text-purple-700 font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-white/90 transition"
        >
          Save
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/80 px-4 py-2 rounded mb-6 max-w-2xl text-center font-semibold shadow">
          {error}
        </div>
      )}

      {/* Display */}
      {recommendations.length > 0 && (
        <div className="w-full md:lg:h-170 ">
          <h2 className="text-2xl md:lg:text-4xl font-bold mb-4 font-serif"> Recommended Movies for You</h2>
           <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-6 md:lg:h-150">
          {recommendations.map((movie, index) => ( 
           <Card  className="mx-auto w-full bg-black/30 text-white border-none" key={index + 1}>
      <CardHeader>
        <CardTitle className="text-xl lg:text-2xl font-serif">{movie.title}</CardTitle>
        <CardDescription className="flex gap-5 mt-3">
          <p  className="rounded-xl border-1 p-2 px-4 lg:text-lg text-sm">{movie.year}</p>
          <p className="rounded-xl border-1 p-2 px-4 lg:text-lg text-sm">{movie.genre}</p>
        </CardDescription>
        <CardDescription>
          <p className="lg:text-lg text-sm">Directed By <span className="font-semibold text-white/80">{movie.director}</span></p>
        </CardDescription>
      </CardHeader>
      <CardContent className="">
        <h1 className="text-lg font-semibold font-sans text-orange-300">Why this movie is recommended:</h1>
        <p className="mt-2 lg:text-lg text-white/50 text-sm font-sans">
          {movie.reason}
        </p>
      </CardContent>
    </Card>
        ))}
        
    </div>
        </div>
      )}


      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center mt-6">
          <div className="w-12 h-12 border-4 border-white border-t-transparent border-b-transparent rounded-full animate-spin mb-2"></div>
          <p>AI is finding perfect movies for you...</p>
        </div>
      )}
    </div>
  );
}

export default App;
