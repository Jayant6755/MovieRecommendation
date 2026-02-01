import mongoose, { Schema, Document } from "mongoose";

interface Movie {
  title: string;
  year: string;
  director: string;
  genre: string;
  reason: string;
}

export interface IRecommendation extends Document {
  user_input: string;
  recommended_movies: Movie[];
  timestamp: Date;
}

const RecommendationSchema = new Schema<IRecommendation>({
  user_input: { type: String, required: true },

  recommended_movies: [
    {
      title: String,
      year: String,
      director: String,
      genre: String,
      reason: String,
    },
  ],

  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Recommendation", RecommendationSchema);
