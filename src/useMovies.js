import { useEffect, useState } from "react";

const OMDB_API_KEY = "6fc5422e";

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      // We'll not fix the "callback" issue at this point of the course, so for now we'll leave it as a comment and
      // we'll lose the functionality of automatically closing a movie detail when the query changes.

      // The issue was that adding this callback, that in our case it would have run handleCloseMovie, force us
      // to include this callback in the dependency array of the useEffect hook, and that causes the app to
      // produce an infinite loop saying: "Warning: Maximum update depth exceeded. This can happen when a component
      // calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the
      // dependencies changes on every render. Error Component Stack at App..."

      // callback?.();

      // Like the fetch function below, the AbortController is a Browser API
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(`http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${query}`, {
            signal: controller.signal,
          });

          // Handle non-successful HTTP response
          if (!res.ok) throw new Error("Something went wrong with fetching movies");

          const data = await res.json();

          // Handle OMDB API errors (e.g., invalid query)
          if (data.Response === "False") throw new Error(data.Error);

          setMovies(data.Search);
          setError("");
        } catch (error) {
          // First, we will ignore the AbortError thrown when the request is aborted
          if (error.name !== "AbortError") {
            // Check for network errors (TypeError)
            if (error instanceof TypeError) {
              setError("Network error: Failed to fetch movies. Please check your connection.");
            } else {
              setError(error.message); // Custom errors
            }
          }
        } finally {
          setIsLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }

      fetchMovies();

      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return { movies, isLoading, error };
}
