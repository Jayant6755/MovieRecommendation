import { BrowserRouter, Routes, Route } from "react-router-dom";
import Movie from "./pages/Movie";





function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<Movie />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
