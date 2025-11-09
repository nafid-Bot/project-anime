// App.jsx
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import debounce from 'debounce';
import './App.css';
import Search from './components/Search.jsx';
import Hero from './components/Hero.jsx';
import Loading from './components/loading.jsx';
import MovieCard from './components/movieCard.jsx';
import {getTrendingAnime, recordSearch} from "./appwrite.js";
import Pagination from "./components/pagination.jsx";

const App = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [lastPage, setLastPage] = useState(1);

    // Keep track of the current fetch's AbortController so we can cancel in-flight requests
    const controllerRef = useRef(null);

    const [trendingList,setTrendingList] = useState([]);

    const loadTrendingAnime = async () => {
        try{
            const trendingList = await getTrendingAnime();
            if (trendingList) {
                setTrendingList(trendingList);
            }
            //console.log(trendingList);
        } catch(err){
            // Only log errors in development
            if (import.meta.env.DEV) {
                console.error('loadTrendingAnime error:', err);
            }
        }
    }

    const runFetch = useCallback(async (term, signal, page = 1) => {
        try {
            setLoading(true);
            setError(null);

            const trimmed = term.trim();
            const base = trimmed.length >= 2
                ? `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(trimmed)}&limit=12&sfw&page=${page}`
                : `https://api.jikan.moe/v4/top/anime?filter=airing&limit=12&page=${page}`;

            const res = await fetch(base, { signal });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            const items = data?.data ?? [];
            const pg = data?.pagination ?? {};

            setResults(items);
            setHasNext(Boolean(pg?.has_next_page));
            setLastPage(pg?.last_visible_page ?? 1);

            // record search only for real queries (not top list) on page 1
            if (trimmed.length >= 2 && page === 1 && items.length > 0) {
                const top = items[0];
                recordSearch({
                    term: trimmed,
                    poster_url:
                        top?.images?.jpg?.large_image_url ??
                        top?.images?.jpg?.image_url ??
                        top?.images?.webp?.large_image_url ??
                        top?.images?.webp?.image_url ??
                        null,
                    movie_id: Number.isInteger(top?.mal_id) ? top.mal_id : null,
                }).catch((err) => {
                    // Only log errors in development
                    if (import.meta.env.DEV) {
                        console.error('recordSearch error:', err);
                    }
                });
            }
        } catch (e) {
            if (e.name !== 'AbortError') setError('Failed to fetch results.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounced wrapper that:
    // 1) Aborts the previous request (if any)
    // 2) Starts a new fetch
    const debouncedFetch = useMemo(
        () =>
            debounce((term) => {
                // Abort any in-flight request
                if (controllerRef.current) controllerRef.current.abort();
                const controller = new AbortController();
                controllerRef.current = controller;

                runFetch(term, controller.signal);
            }, 500),
        [runFetch]
    );



    useEffect(() => {
        setPage(1);
        debouncedFetch(searchTerm);
        return () => {
            debouncedFetch.clear?.();
            if (controllerRef.current) controllerRef.current.abort();
        };
    }, [searchTerm, debouncedFetch]);

    useEffect(() => {
        // abort previous, start a new request for this page
        if (controllerRef.current) controllerRef.current.abort();
        const controller = new AbortController();
        controllerRef.current = controller;

        runFetch(searchTerm, controller.signal, page);
        return () => controller.abort();
  //  }, [page, runFetch, searchTerm]);
    }, [page, runFetch]);

    useEffect(() => {
        loadTrendingAnime();

    },[])


    const resultsRef = useRef(null);

    useEffect(() => {
        if (!resultsRef.current) return;
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [page]); // when your page state changes



    return (
        <main>
            <div className="pattern" />

            <div className="wrapper">
                <header className="header">
                    <Hero
                        leftImage={'./Most Powerful Duo in Naruto Shipudden ♥️⚡🔥….jpeg'}
                        centerImage={'Romantic Manga, Cute Anime Pics, Emo Pfp, Anime….jpeg'}
                        rightImage={'./Happy new Year from Zenitsu….jpeg'}
                    />
                    <h1 className="py-15 text-center">
                        Find <span className="text-gradient">Anime</span> You'll Love Without the Hassle
                    </h1>
                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>


                
                {error && <p className="mt-6 text-red-500">{error}</p>}
                <div>
                    {trendingList.length > 0 && (
                        <section className="trending">
                            <h2 className={"mb-10 text-left"}> Trending </h2>

                            <ul>
                                {trendingList.map((item, i) => (
                                    <li key={item.$id}>
                                        <p className = " text-transparent font-thin">{i+1}</p>
                                        <img className={"z-10"} src={item.poster_url} alt={item.title} />
                                    </li>
                                ))}

                            </ul>

                        </section>

                    )}

                    <h2 id="results" ref={resultsRef} className="text-left mt-10">Popular</h2>

                    {loading && (
                        <div className="mt-6 opacity-70 justify-items-center">
                            <Loading />
                        </div>
                    )}

                    {!loading && !error && results.length > 0 && (
                        <>
                            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {results.map((item) => (
                                    <li key={item.mal_id} className="rounded-xl border p-3 bg-white/5">
                                        <MovieCard
                                            title={item.title}
                                            episodes={item.episodes}
                                            score={item.score}
                                            type={item.type}
                                            image={
                                                item.images?.jpg?.large_image_url ??
                                                item.images?.jpg?.image_url ??
                                                item.images?.webp?.large_image_url ??
                                                item.images?.webp?.image_url
                                            }
                                            description={item.synopsis}
                                        />
                                    </li>
                                ))}
                            </ul>
                            <Pagination page={page} setPage={setPage} hasNext={hasNext} lastPage={lastPage} />
                        </>
                    )}

                    {!loading && !error && results.length === 0 && (
                        <p className="mt-6 opacity-70">Try searching for an anime (min. 2 characters)…</p>
                    )}
                </div>
            </div>
        </main>
    );
};

export default App;
