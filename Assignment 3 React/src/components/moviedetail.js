import React, { useEffect, useState } from 'react';
import { fetchMovie, submitReview } from '../actions/movieActions';
import { useDispatch, useSelector } from 'react-redux';
import { Card, ListGroup, ListGroupItem, Image, Form, Button } from 'react-bootstrap';
import { BsStarFill } from 'react-icons/bs';
import { useParams } from 'react-router-dom';

const MovieDetail = () => {
  const dispatch = useDispatch();
  const { movieId } = useParams();
  const selectedMovie = useSelector(state => state.movie.selectedMovie);
  const loading = useSelector(state => state.movie.loading);
  const error = useSelector(state => state.movie.error);

  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    dispatch(fetchMovie(movieId));
  }, [dispatch, movieId]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    dispatch(submitReview(movieId, { review: reviewText, rating: parseInt(rating) }));
    setReviewText('');
    setRating(5);
  };
  
  if (loading) {
    return <div className="text-light mt-5 text-center">Loading....</div>;
  }

  if (error) {
    return <div className="text-light mt-5 text-center">Error: {error}</div>;
  }

  if (!selectedMovie) {
    return <div className="text-light mt-5 text-center">No movie data available.</div>;
  }

  return (
    <Card className="bg-dark text-dark p-4 rounded">
      <Card.Header className="text-light">Movie Detail</Card.Header>
      <Card.Body>
        <Image className="image" src={selectedMovie.imageUrl} thumbnail />
      </Card.Body>
      <ListGroup>
        <ListGroupItem><h3>{selectedMovie.title}</h3></ListGroupItem>
        <ListGroupItem>
          {selectedMovie.actors && Array.isArray(selectedMovie.actors) && selectedMovie.actors.map((actor, i) => (
            <p key={i}>
              <b>{actor.actorName}</b> as {actor.characterName}
            </p>
          ))}
        </ListGroupItem>
        <ListGroupItem>
          <h4>
            <BsStarFill className="text-warning" /> {selectedMovie.avgRating ? selectedMovie.avgRating.toFixed(1) : 'No Ratings Yet'}
          </h4>
        </ListGroupItem>
      </ListGroup>

      <Card.Body className="card-body bg-light mt-3 rounded">
        <h5 className="mb-3">User Reviews</h5>
        {selectedMovie.reviews && selectedMovie.reviews.length > 0 ? (
          selectedMovie.reviews.map((review, i) => (
            <div key={i} className="mb-2 border-bottom pb-2">
              <b>{review.username}</b> &nbsp; 
              <span className="text-muted"><BsStarFill className="text-warning"/> {review.rating}/5</span>
              <p className="mb-0">{review.review}</p>
            </div>
          ))
        ) : (
          <p>No reviews yet. Be the first to review!</p>
        )}
      </Card.Body>

      <Card.Body className="bg-light mt-3 rounded">
        <h5>Leave a Review</h5>
        <Form onSubmit={handleReviewSubmit}>
          <Form.Group className="mb-3" controlId="reviewRating">
            <Form.Label>Rating</Form.Label>
            <Form.Select 
              value={rating} 
              onChange={(e) => setRating(e.target.value)}
              required
            >
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Good</option>
              <option value="3">3 - Average</option>
              <option value="2">2 - Poor</option>
              <option value="1">1 - Terrible</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="reviewText">
            <Form.Label>Review</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              placeholder="Write your review here..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Submit Review
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default MovieDetail;