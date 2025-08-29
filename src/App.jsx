import { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite.js'

gsap.registerPlugin(ScrollTrigger);

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

  // Ref for the hero image
  const heroImgRef = useRef(null);
  const cardsRef = useRef([]);
  const patternRef = useRef(null);
  const wiggleRef = useRef(null);

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

  // Animate hero image on scroll
  useEffect(() => {
    if (heroImgRef.current) {
      // ScrollTrigger entrance animation
      gsap.fromTo(
        heroImgRef.current,
        { scale: 0.9, autoAlpha: 0 },
        {
          scale: 1,
          autoAlpha: 1,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: heroImgRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );
      // Floating animation (continuous)
      gsap.to(heroImgRef.current, {
        y: -16,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
  }, []);

  // Animate movie cards on load
  useEffect(() => {
    if (cardsRef.current.length) {
      // Animate only the last batch of cards (e.g., the last 20)
      const batchSize = 20;
      const startIdx = Math.max(cardsRef.current.length - batchSize, 0);
      const newCards = cardsRef.current.slice(startIdx);

      gsap.fromTo(
        newCards,
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".all-movies ul",
            start: "top 90%",
          }
        }
      );
    }
  }, [movieList]);

  // Animate background pattern with gradient shift
  useEffect(() => {
    if (patternRef.current) {
      gsap.to(patternRef.current, {
        backgroundPosition: "200% 100%",
        duration: 16,
        repeat: -1,
        ease: "linear",
        yoyo: true
      });
    }
  }, []);

  // Animate SVG wiggle line on scroll
  useEffect(() => {
    const path = document.getElementById('wiggle-path');
    if (path) {
      const length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;

      gsap.to(path, {
        strokeDashoffset: 0,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: ".wrapper",
          start: "top top",
          end: "bottom bottom",
          scrub: 1
        }
      });

      // Animate the wiggle horizontally
      gsap.to(path, {
        keyframes: [
          { attr: { d: "M 200 0 Q 100 200 200 400 T 250 800 T 150 1200 T 200 1600" }, duration: 2 },
          { attr: { d: "M 200 0 Q 300 200 200 400 T 150 800 T 250 1200 T 200 1600" }, duration: 2 },
          { attr: { d: "M 200 0 Q 100 200 200 400 T 200 800 T 200 1200 T 200 1600" }, duration: 2 }
        ],
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }
  }, []);

  useEffect(() => {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    const moveCursor = (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <main>
      <div
        className="pattern"
        style={{
          pointerEvents: 'none',
          zIndex: 4,
          position: 'fixed',
          width: '100vw',
          height: '100vh',
          top: 0,
          left: 0,
        }}
      >
        <svg
          id="wiggle-svg"
          width="100vw"
          height="100vh"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 4,
            filter: 'blur(8px)', // Silk effect
            opacity: 0.7,        // Silk effect
            pointerEvents: 'none'
          }}
        >
          <defs>
            <linearGradient id="silk-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a21caf" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#a21caf" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          <path
            id="wiggle-path"
            d="M 200 0 Q 100 200 200 400 Q 300 600 200 800"
            stroke="url(#silk-gradient)"
            strokeWidth="56"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="2000"
            strokeDashoffset="2000"
          />
        </svg>
      </div>
      <div id="custom-cursor"></div>
      <div className="wrapper">
        <header>
          <img ref={heroImgRef} src="./hero.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

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

        <section className="all-movies">
          <h2>All Movies</h2>
          {errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <>
              <ul>
                {movieList.map((movie, idx) => (
                  <div
                    key={movie.id}
                    ref={el => (cardsRef.current[idx] = el)}
                  >
                    <MovieCard movie={movie} />
                  </div>
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