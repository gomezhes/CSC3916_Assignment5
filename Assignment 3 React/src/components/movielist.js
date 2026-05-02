import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMovies, searchMovies, setMovie } from "../actions/movieActions";
import { Link } from 'react-router-dom';
import { Image, Form, Button, Accordion, Container, Row, Col } from 'react-bootstrap';
import { BsStarFill } from 'react-icons/bs';

function MovieList() {
    const dispatch = useDispatch();
    const movies = useSelector(state => state.movie.movies);
    const [searchTerm, setSearchTerm] = useState('');

    const memoizedMovies = useMemo(() => {
        return movies;
    }, [movies]);

    useEffect(() => {
        dispatch(fetchMovies());
    }, [dispatch]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim() === '') {
            dispatch(fetchMovies());
        } else {
            dispatch(searchMovies(searchTerm));
        }
    };

    const handleClick = (movie) => {
        dispatch(setMovie(movie));
    };

    if (!memoizedMovies || !Array.isArray(memoizedMovies)) {
        return <div>Loading....</div>;
    }

    return (
        <Container className="mt-4">
            <Form onSubmit={handleSearch} className="mb-4 d-flex">
                <Form.Control 
                    type="text" 
                    placeholder="Search by partial movie title or actor name..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="me-2"
                />
                <Button variant="primary" type="submit">
                    Search
                </Button>
                <Button 
                    variant="outline-secondary" 
                    className="ms-2"
                    onClick={() => {
                        setSearchTerm('');
                        dispatch(fetchMovies());
                    }}
                >
                    Clear
                </Button>
            </Form>

            {memoizedMovies.length === 0 ? (
                <div className="text-center text-light mt-5"><h5>No movies found matching your search.</h5></div>
            ) : (
                <Accordion>
                    {memoizedMovies.map((movie, index) => (
                        <Accordion.Item eventKey={index.toString()} key={movie._id}>
                            <Accordion.Header>
                                <strong>{movie.title}</strong> 
                                <span className="ms-3 text-muted">
                                    <BsStarFill className="text-warning mb-1 me-1"/> 
                                    {movie.avgRating ? movie.avgRating.toFixed(1) : 'No Ratings'}
                                </span>
                            </Accordion.Header>
                            <Accordion.Body className="bg-light">
                                <Row>
                                    <Col md={3}>
                                        <Image src={movie.imageUrl} thumbnail fluid />
                                    </Col>
                                    <Col md={9}>
                                        <h5>Cast</h5>
                                        <ul>
                                            {movie.actors && Array.isArray(movie.actors) && movie.actors.map((actor, i) => (
                                                <li key={i}>
                                                    <b>{actor.actorName}</b> as {actor.characterName}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-4">
                                            <Link 
                                                to={`/movie/${movie._id}`} 
                                                className="btn btn-primary" 
                                                onClick={() => handleClick(movie)}
                                            >
                                                View Reviews & Leave a Rating
                                            </Link>
                                        </div>
                                    </Col>
                                </Row>
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>
            )}
        </Container>
    );
}

export default MovieList;