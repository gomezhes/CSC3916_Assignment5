const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const authJwtController = require('./auth_jwt'); // You're not using authController, consider removing it
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./Users');
const Movie = require('./Movies');
const Review = require('./Reviews'); // You're not using Movie, consider removing it
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

const router = express.Router();

// Removed getJSONObjectForMovieRequirement as it's not used

router.post('/signup', async (req, res) => { // Use async/await
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ success: false, msg: 'Please include both username and password to signup.' }); // 400 Bad Request
  }

  try {
    const user = new User({ // Create user directly with the data
      name: req.body.name,
      username: req.body.username,
      password: req.body.password,
    });

    await user.save(); // Use await with user.save()

    res.status(201).json({ success: true, msg: 'Successfully created new user.' }); // 201 Created
  } catch (err) {
    if (err.code === 11000) { // Strict equality check (===)
      return res.status(409).json({ success: false, message: 'A user with that username already exists.' }); // 409 Conflict
    } else {
      console.error(err); // Log the error for debugging
      return res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' }); // 500 Internal Server Error
    }
  }
});


router.post('/signin', async (req, res) => { // Use async/await
  try {
    const user = await User.findOne({ username: req.body.username }).select('name username password');

    if (!user) {
      return res.status(401).json({ success: false, msg: 'Authentication failed. User not found.' }); // 401 Unauthorized
    }

    const isMatch = await user.comparePassword(req.body.password); // Use await

    if (isMatch) {
      const userToken = { id: user._id, username: user.username }; // Use user._id (standard Mongoose)
      const token = jwt.sign(userToken, process.env.SECRET_KEY, { expiresIn: '1h' }); // Add expiry to the token (e.g., 1 hour)
      res.json({ success: true, token: 'JWT ' + token });
    } else {
      res.status(401).json({ success: false, msg: 'Authentication failed. Incorrect password.' }); // 401 Unauthorized
    }
  } catch (err) {
    console.error(err); // Log the error
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' }); // 500 Internal Server Error
  }
});

router.route('/reviews')
  .get(authJwtController.isAuthenticated, async (req, res) => { 
    try {
        const reviews = await Review.find({});
        return res.json(reviews);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Error retrieving reviews',
        error: err.message
      });
    }
  })

  .post(authJwtController.isAuthenticated, async (req, res) => {
    try {
      const movie = await Movie.findById(req.body.movieId);
      if (!movie) {
        return res.status(404).json({ success: false, message: 'Movie not found.'});
      }

      const review = new Review({
          movieId: req.body.movieId,
          username: req.user.username,
          review: req.body.review,
          rating: req.body.rating
      });
      await review.save();
      return res.status(200).json({
          success: true,
          message: 'Review created!',
          review: review
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'A review with that ID already exists'
        });
      }
      return res.status(500).json({
          success: false,
          message: 'Error creating review',
          error: err.message
        });
    }
  })


router.route('/movies')
  .get(authJwtController.isAuthenticated, async (req, res) => {
    try {
      if (req.query.reviews === 'true') {
        const moviesWithReviews = await Movie.aggregate([{
          $lookup: {
            from: 'reviews',
            localField: '_id',
            foreignField: 'movieId',
            as: 'movieReviews'
          }
    },
    {
      $addFields: {
        avgRating: { $avg: '$movieReviews.rating' }
      }
    },
    {
      $sort: { avgRating: -1 }
          }
        ]);
        return res.status(200).json(moviesWithReviews);
      }
      const movies = await Movie.find({});
      res.status(200).json(movies);
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to retrieve movies'});
    }
  }) 
  
  .post(authJwtController.isAuthenticated, async (req, res) => {
    try {
      const movie = new Movie(req.body);
      
      const savedMovie = await movie.save(); 
      
      res.status(201).json({ 
        success: true, 
        message: 'Movie successfully saved.', 
        movie: savedMovie 
      });
      
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to save movie. Please check your data.' });
    }
  })
  
  .put(authJwtController.isAuthenticated, (req, res) => {
    res.status(405).json({ success: false, message: 'PUT request not supported on /movies.' });
  })
  
  .delete(authJwtController.isAuthenticated, (req, res) => {
    res.status(405).json({ success: false, message: 'DELETE request not supported on /movies.' });
  });

router.route('/movies/:id')
  .get(authJwtController.isAuthenticated, async (req, res) => {
    const id = req.params.id;
    try {
      if (req.query.reviews === 'true') {
        const moviesWithReviews = await Movie.aggregate([
          { $match: { _id: new mongoose.Types.ObjectId(id)}},
          {
            $lookup: {
              from: 'reviews',
              localField: '_id',
              foreignField: 'movieId',
              as: 'reviews'
            }
          },
          {
            $addFields: {
              avgRating: { $avg: '$reviews.rating' }
            }
          }
        ]); 
        if (!moviesWithReviews || moviesWithReviews.length === 0) {
          return res.status(404).json({ success: false, message: 'Movie not found.'});
        }
        
        return res.status(200).json(moviesWithReviews); 
      }  
      const movie = await Movie.findById(id);
      if (!movie) return res.status(404).json({ success: false, message: 'Movie not found.'});
      res.status(200).json(movie);
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Error retrieving movie data.'});
    }
  });

router.route('/movies/search')
  .post(authJwtController.isAuthenticated, async (req, res) => {
    try {
      const searchTerm = req.body.q;
      if (!searchTerm) {
        return res.status(400).json({ success: false, message: 'Search term is required.' });
      }

      const regex = new RegExp(searchTerm, 'i');

      const movies = await Movie.aggregate([
        {
          $match: {
            $or: [
              { title: regex },
              { 'actors.actorName': regex }
            ]
          }
        },
        {
          $lookup: {
            from: 'reviews',
            localField: '_id',
            foreignField: 'movieId',
            as: 'reviews'
          }
        },
        {
          $addFields: {
            avgRating: { $avg: '$reviews.rating' }
          }
        },
        {
          $sort: { avgRating: -1 }
        }
      ]);

      res.status(200).json(movies);
    } catch (err) {
      console.error("Search Error:", err);
      res.status(500).json({ success: false, message: 'Search failed.' });
    }
  }); 

app.use('/', router);

const PORT = process.env.PORT || 8080; // Define PORT before using it
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // for testing only

