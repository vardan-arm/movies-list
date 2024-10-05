import {useState, useEffect, useCallback} from 'react';
import {Star, ChevronDown, ChevronUp, Menu, X} from 'lucide-react';

// TODO: I intentionally kept `API_KEY` here to not spend time on deployment. In a real app, this would be stored in `.env` file
const API_KEY = 'dfba7ad103c688fd477dddc0a35f3fa9';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

interface IMovie {
  // eslint-disable-next-line
  [key: string]: any;
}

interface IGenre {
  [key: string]: never;
}

const MovieDashboard = () => {
  const [movies, setMovies] = useState<IMovie[]>([]);
  const [genres, setGenres] = useState<IGenre[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const fetchGenres = useCallback(async () => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`);
      const data = await response.json();
      const genreMap = data.genres.reduce((acc: { [key: number]: string }, genre: IGenre) => {
        acc[genre.id] = genre.name;
        return acc;
      }, {});

      setGenres(genreMap);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  }, []);

  const fetchMovies = useCallback(async () => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/popular?page=${page}&api_key=${API_KEY}`);
      const data = await response.json();
      setMovies(data.results);
    } catch (error) {
      console.error('Error fetching movie data:', error);
    }
  }, [page]);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const toggleCardExpansion = (id: number) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const removeCard = (id: number) => {
    setMovies(movies.filter(movie => movie.id !== id));
  };

  const getVoteColor = (vote: number) => {
    if (vote >= 7) {
      return 'text-green-500';
    }
    if (vote >= 5) {
      return 'text-yellow-500';
    }
    return 'text-red-500';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 lg:flex-row">
      <button
        className={`lg:hidden fixed top-4 left-4 z-50 ${isMenuOpen ? 'bg-gray-700' : 'bg-blue-500 hover:bg-blue-600'} text-white p-2 rounded`}
        onClick={toggleMenu}
      >
        {isMenuOpen ? <X size={24} /> : <Menu />}
      </button>

      <div className={`
        w-full lg:w-1/5 bg-gray-800 p-6 pb-4 flex flex-col justify-between
        fixed inset-y-0 left-0 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        pt-16 lg:pt-0
        lg:relative lg:translate-x-0 transition duration-200 ease-in-out z-40
      `}>
        <div>
          <h2 className="text-white text-2xl font-bold mb-6">Main Menu</h2>
          <ul>
            <li className="text-white hover:text-gray-300 cursor-pointer mb-2">Menu item 1</li>
            <li className="text-white hover:text-gray-300 cursor-pointer mb-2">Menu item 2</li>
          </ul>
        </div>
        <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition duration-300">
          Log out
        </button>
      </div>

      <div className="w-full lg:w-4/5 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="ml-12 text-lg lg:ml-0 lg:text-2xl font-bold text-gray-800">Popular Movies</h1>
          <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-300">
            Header Button
          </button>
        </header>

        <main className="flex-grow p-6 overflow-y-auto bg-gray-100">
          {movies.map((movie) => {
            return (
              <div
                key={movie.id}
                className={`text-xs lg:text-base bg-white rounded-lg shadow-md mb-4 overflow-hidden transition-all duration-500 ease-in-out ${
                  expandedCard === movie.id ? 'max-h-[800px]' : 'max-h-[180px]'
                }`}
              >
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition duration-300 flex"
                  onClick={() => toggleCardExpansion(movie.id)}
                >
                  <img
                    src={`${IMAGE_BASE_URL}${movie.poster_path}`}
                    alt={movie.title}
                    className="w-12 lg:w-24 lg:h-36 object-cover rounded mr-4"
                  />
                  <div className="flex-grow">
                    <h3 className="text-sm lg:text-xl font-bold text-gray-800 mb-2">{movie.title}</h3>
                    <div className="flex items-center">
                      <Star className={`w-5 h-5 ${getVoteColor(movie.vote_average)} mr-1`} />
                      <span className={`font-bold ${getVoteColor(movie.vote_average)}`}>
                      {movie.vote_average.toFixed(1)}
                    </span>
                    </div>
                  </div>
                  <div className="text-[8px] sm:text-sm text-gray-500 mr-2 lg:mr-8">
                    <span className="font-bold">Release date</span>
                    <div>{new Date(movie.release_date).toLocaleDateString()}</div>
                  </div>
                  {expandedCard === movie.id ? <ChevronUp className="w-6 h-6 text-gray-500" /> :
                    <ChevronDown className="w-6 h-6 text-gray-500" />}
                </div>
                <div
                  className={`p-4 transition-all duration-500 ${expandedCard === movie.id ? 'opacity-100 max-h-[600px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                  <div className="lg:flex mb-4 lg:gap-6 mr-2 lg:mr-8">
                    <div className="text-gray-600 shrink-0">
                      <p className="mb-2"><span
                        className="font-bold">Original Language:</span> {(movie.original_language as string).toUpperCase()}
                      </p>
                      <p className="mb-2"><span
                        className="font-bold">Adult Content:</span> {movie.adult ? 'Yes' : 'No'}</p>
                      <p className="mb-2"><span className="font-bold">Vote Count:</span> {movie.vote_count}
                      </p>
                      <div className="">
                        <span className="font-bold">Genres:</span>
                        <div className="flex flex-wrap mt-1">
                          {movie.genre_ids.map((genreId: number) => (
                            <span key={genreId}
                                  className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 mb-2 px-2.5 py-0.5 rounded">
                            {genres[genreId].toString()}
                          </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-600">
                      <span className="font-bold">Overview</span>
                      <div className="mt-2 text-gray-600">
                        {movie.overview}
                      </div>
                    </div>
                  </div>
                  <div
                    className="flex justify-center md:justify-end space-x-2 mx-2 md:mr-8 text-[12px] font-semibold lg:font-normal lg:text-base ">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded transition duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}>
                      Watch Trailer
                    </button>
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded transition duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}>
                      Add to Watchlist
                    </button>
                    <button className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded transition duration-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCard(movie.id);
                            }}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </main>

        <footer className="bg-gray-800 p-4 flex justify-between items-center">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={() => setPage(prevPage => Math.max(1, prevPage - 1))}
            disabled={page === 1}
          >
            Previous Page
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-300"
            onClick={() => setPage(prevPage => prevPage + 1)}
          >
            Next Page
          </button>
        </footer>
      </div>
    </div>
  );
};

export default MovieDashboard;
