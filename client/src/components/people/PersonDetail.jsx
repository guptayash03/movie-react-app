import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LazyLoad from 'react-lazyload';
import { fetchPersonById, fetchPersonMovieCredits, fetchPersonTVCredits } from '../../service/api';
import Container from '../ui/Container';
import SpinnerCustom from '../ui/SpinnerCustom';
import ButtonToTop from '../ui/ButtonToTop';
import ToggleTextButton from '../ui/ToggleTextButton';
import { formatFullDate, formatDate, formatVoteAverage } from '../../utils/Helper';
import { FaStar } from 'react-icons/fa';

// Component to display detailed information about a person (actor, director, etc.)
const PersonDetail = ({ personId }) => {
  const [person, setPerson] = useState(null); // Store person detail
  const [movieCredits, setMovieCredits] = useState([]); // Movie credits (cast & crew)
  const [tvCredits, setTvCredits] = useState([]); // TV credits (cast & crew)
  const [loading, setLoading] = useState(true); // Loading state
  const [showFullBiography, setShowFullBiography] = useState(false); // Toggle for full biography
  const navigate = useNavigate();

  // Fetch person details and credits when component mounts or personId changes
  useEffect(() => {
    const getPersonDetails = async () => {
      setLoading(true);
      try {
        const personData = await fetchPersonById(personId);

        // Redirect to 404 page if person not found
        if (!personData || !personData.name) {
          navigate('/404');
          return;
        }

        setPerson(personData);

        // Fetch movie and TV credits
        const movieCreditsData = await fetchPersonMovieCredits(personId);
        const tvCreditsData = await fetchPersonTVCredits(personId);

        // Combine cast and crew, then sort by release date
        const combinedMovieCredits = [...(movieCreditsData.cast || []), ...(movieCreditsData.crew || [])];
        const combinedTvCredits = [...(tvCreditsData.cast || []), ...(tvCreditsData.crew || [])];

        const sortedMovieCredits = combinedMovieCredits.sort((a, b) => {
          if (!a.release_date) return 1;
          if (!b.release_date) return -1;
          return new Date(b.release_date) - new Date(a.release_date);
        });

        const sortedTvCredits = combinedTvCredits.sort((a, b) => {
          if (!a.first_air_date) return 1;
          if (!b.first_air_date) return -1;
          return new Date(b.first_air_date) - new Date(a.first_air_date);
        });

        setMovieCredits(sortedMovieCredits);
        setTvCredits(sortedTvCredits);
      } catch (error) {
        // If error occurs (e.g., network or bad ID), redirect to 404
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };

    getPersonDetails();
  }, [personId, navigate]);

  // Set the document title to include person's name
  useEffect(() => {
    if (person?.name) {
      document.title = `Dibimovie | ${person.name}`;
    }
  }, [person]);

  // Show spinner while loading data
  if (loading) {
    return (
      <div className="d-flex justify-content-center pt-4 position-absolute top-50 start-50 translate-middle ">
        <SpinnerCustom />
      </div>
    );
  }

  // If no person data found
  if (!person) {
    return (
      <Container>
        <p>Person details not found.</p>
      </Container>
    );
  }

  // Prepare biography text (shortened if too long)
  const biographyText = person.biography || '-';
  const isLongBiography = biographyText.length > 200;
  const displayedBiography = showFullBiography ? biographyText : `${biographyText.substring(0, 200)}`;

  return (
    <Container>
      {/* Person Info Section */}
      <div className="d-flex gap-4 justify-content-start align-items-start flex-column flex-md-row">
        {/* Always show profile image, fallback to default if unavailable */}
        <div className="person-img-wrapper w-100 mb-0">
          <LazyLoad height={200} offset={0} placeholder={<img src="/profile.png" alt="loading" className="person-img rounded-4" />}>
            <img className="person-img rounded-4" src={person.profile_path ? `https://image.tmdb.org/t/p/w500${person.profile_path}` : '/profile.png'} alt={person.name || 'Profile image'} />
          </LazyLoad>
        </div>

        {/* Person Info Text */}
        <div className="w-100">
          <div className="d-flex justify-content-sm-start justify-content-between align-items-center gap-3 mb-4">
            <p className="h4 text fw-bold m-0">{person.name || '-'}</p>
            {/* IMDb link if available */}
            {person.imdb_id && (
              <a href={`https://www.imdb.com/name/${person.imdb_id}/`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary border-0 rounded-5 py-1 px-3" style={{ whiteSpace: 'nowrap' }}>
                View on IMDb
              </a>
            )}
          </div>

          {/* Additional Info */}
          <p className="text-secondary">
            Known for: <span className="text-tertiary">{person.known_for_department || '-'}</span>
          </p>
          <p className="text-secondary">
            Birthday: <span className="text-tertiary">{person.birthday ? formatFullDate(person.birthday) : '-'}</span>
          </p>
          <p className="text-secondary">
            Place of Birth: <span className="text-tertiary">{person.place_of_birth || '-'}</span>
          </p>
          {person.deathday && (
            <p className="text-secondary">
              Date of Death: <span className="text-tertiary">{formatFullDate(person.deathday)}</span>
            </p>
          )}
        </div>
      </div>

      {/* Biography Section */}
      {biographyText !== '-' && (
        <p className="card-text text-secondary lh-lg mt-md-3">
          Biography:
          <span className="text-tertiary ms-1">
            {displayedBiography}
            {isLongBiography && !showFullBiography && <span className="text-secondary">...</span>}
            {isLongBiography && <ToggleTextButton isLongText={isLongBiography} showFullOverview={showFullBiography} handleToggleOverview={() => setShowFullBiography((prev) => !prev)} />}
          </span>
        </p>
      )}

      {/* ----------------- Credits Tabs ----------------- */}
      <div className="mt-4">
        {/* Tab Headers */}
        <div className="sticky-top py-2">
          <ul className="nav nav-tabs d-flex justify-content-sm-start gap-3" id="credit-tabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button className="nav-link tab py-3 bg-transparent fw-bold active" id="movie-credits-tab" data-bs-toggle="tab" data-bs-target="#movie-credits" type="button" role="tab" aria-controls="movie-credits" aria-selected="true">
                Movie Credits
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button className="nav-link tab py-3 fw-bold bg-transparent" id="tv-credits-tab" data-bs-toggle="tab" data-bs-target="#tv-credits" type="button" role="tab" aria-controls="tv-credits" aria-selected="false">
                TV Credits
              </button>
            </li>
          </ul>
        </div>

        {/* Tab Content: Movie Credits */}
        <div className="tab-content" id="credit-tabs-content">
          <div className="tab-pane fade show active" id="movie-credits" role="tabpanel" aria-labelledby="movie-credits-tab">
            <div className="row">
              {movieCredits.length > 0 ? (
                movieCredits.map((credit, index) => (
                  <div key={`${credit.id}-movie-${index}`} className="col-lg-4 col-sm-6 my-sm-2 my-0">
                    <div className="d-flex gap-3 justify-content-start align-items-start">
                      {/* Show poster with fallback */}
                      <LazyLoad height={200} offset={100} placeholder={<img src="/default-poster.webp" alt="loading" className="credit-poster rounded-1" />}>
                        <img className="credit-poster rounded-1" src={credit.poster_path ? `https://image.tmdb.org/t/p/w200${credit.poster_path}` : '/default-poster.webp'} alt={credit.title || 'Poster'} />
                      </LazyLoad>
                      <div className="w-100">
                        <div className="mb-2">
                          <Link to={`/movies/${credit.id}`} className="person-credit-link text fw-normal">
                            {credit.title || credit.name} <span className="text-secondary">as</span> {credit.job || credit.character || '-'}
                          </Link>
                        </div>
                        <div className="d-flex gap-3 justify-content-sm-start justify-content-between align-items-center">
                          <small className="text-secondary">{credit.release_date ? formatDate(credit.release_date) : '-'}</small>
                          <small className="text d-flex align-items-center">
                            <FaStar className="text-yellow me-1" />
                            {formatVoteAverage(credit.vote_average)}
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="hr d-sm-none"></div>
                  </div>
                ))
              ) : (
                <div className="text-sm-start text-center pt-3">
                  <small className="text-secondary fst-italic">No movie credits available.</small>
                </div>
              )}
            </div>
          </div>

          {/* Tab Content: TV Credits */}
          <div className="tab-pane fade" id="tv-credits" role="tabpanel" aria-labelledby="tv-credits-tab">
            <div className="row">
              {tvCredits.length > 0 ? (
                tvCredits.map((credit, index) => (
                  <div key={`${credit.id}-tv-${index}`} className="col-lg-4 col-sm-6 my-sm-2 my-0">
                    <div className="d-flex gap-3 justify-content-start align-items-start">
                      <LazyLoad height={200} offset={100} placeholder={<img src="/default-poster.webp" alt="loading" className="credit-poster rounded-1" />}>
                        <img className="credit-poster rounded-1" src={credit.poster_path ? `https://image.tmdb.org/t/p/w200${credit.poster_path}` : '/default-poster.webp'} alt={credit.name || 'Poster'} />
                      </LazyLoad>
                      <div className="w-100">
                        <div className="mb-2">
                          <Link to={`/tv-shows/${credit.id}`} className="person-credit-link text fw-normal">
                            {credit.name || credit.title} <span className="text-secondary">as</span> {credit.job || credit.character || '-'}
                          </Link>
                        </div>
                        <div className="d-flex gap-3 justify-content-sm-start justify-content-between align-items-center">
                          <small className="text-secondary">{credit.first_air_date ? formatDate(credit.first_air_date) : '-'}</small>
                          <small className="text d-flex align-items-center">
                            <FaStar className="text-yellow me-1" />
                            {formatVoteAverage(credit.vote_average)}
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="hr d-sm-none"></div>
                  </div>
                ))
              ) : (
                <div className="text-sm-start text-center pt-3">
                  <small className="text-secondary fst-italic">No TV credits available.</small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      <ButtonToTop />
    </Container>
  );
};

export default PersonDetail;
