import { useEffect, useState } from 'react'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite.js'

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [searchTerm, setSearchTerm] = useState('');

  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [trendingMovies, setTrendingMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Debounce the search term to prevent making too many API requests
  // by waiting for the user to stop typing for 500ms
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

  const fetchMovies = async (query = '', pageNumber = 1) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${pageNumber}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${pageNumber}`;

      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();

      if(data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }

      // Check if we've reached the last page
      setHasMore(data.page < data.total_pages);
      
      // If it's page 1, replace the list, otherwise append
      if (pageNumber === 1) {
        setMovieList(data.results || []);
      } else {
        setMovieList(prevMovies => [...prevMovies, ...(data.results || [])]);
      }

      if(query && data.results.length > 0 && pageNumber === 1) {
        await updateSearchCount(query, data.results[0]);
        await loadTrendingMovies();
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  const handleScroll = () => {
    // Don't fetch if we're already loading or there's no more data
    if (isLoading || !hasMore) return;
    
    // Check if we're near bottom of page
    const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
    const scrollThreshold = document.documentElement.offsetHeight - 300;
    
    if (scrollPosition >= scrollThreshold) {
      setPage(prevPage => prevPage + 1);
    }
  };

  // Listen for scroll events
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, hasMore]); // Re-add listener if these dependencies change

  // Load more movies when page changes
  useEffect(() => {
    if (page > 1) {
      fetchMovies(debouncedSearchTerm, page);
    }
  }, [page]);

  // Reset pagination when search term changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchMovies(debouncedSearchTerm, 1);
  }, [debouncedSearchTerm]);

  return (
    <main>
      <div className="pattern"/>

      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
            <h1>Your Personal <span className="text-gradient">Movie</span> Recommendation Engine</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {(trendingMovies.length > 0 || true) && (
          <section className="trending">
            <h2>Trending Movies</h2>
            {trendingMovies.length === 0 ? (
              <p>No trending movies yet</p>
            ) : (
              <ul>
                {trendingMovies.map((movie, index) => (
                  <li key={movie.$id}>
                    <p>{index + 1}</p>
                    <img src={movie.poster_url} alt={movie.searchTerm} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>

          {errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <>
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>
              
              {isLoading && (
                <div className="flex justify-center mt-8">
                  <Spinner />
                </div>
              )}
              
              {!hasMore && movieList.length > 0 && (
                <p className="text-center mt-8">No more movies to load</p>
              )}
            </>
          )}
        </section>

        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-full text-xs shadow-lg">
          Made by <span className="font-semibold">Tam 😻</span> | Powered by <span className="font-semibold">TMDB</span>
        </div>
      </div>
    </main>
  )
}

export default App