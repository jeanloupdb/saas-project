const express = require('express');
const axios = require('axios');
const router = express.Router();
const logger = require('../logger');
const { language } = require('googleapis/build/src/apis/language');

router.get('/search-placeid', async (req, res) => {
  const searchQuery = req.query.query;
  const apiKey = process.env.GOOGLE_API_KEY;

  try {
    console.log('Searching for place ID:', searchQuery);
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
      params: {
        input: searchQuery,
        inputtype: 'textquery',
        fields: 'place_id,name,formatted_address',
        key: apiKey,
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching place ID:', error.message);  // Log seulement le message d'erreur
    res.status(500).json({ message: 'Error fetching place ID', error: error.message });  // Retourne seulement le message d'erreur
  }
});
router.get('/get-reviews', async (req, res) => {
  const placeId = req.query.place_id;
  const apiKey = process.env.GOOGLE_API_KEY;

  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
      params: {
        place_id: placeId,
        key: apiKey,
        fields: 'reviews',
        language: 'fr', // Spécifiez la langue souhaitée ici
      }
    });

    const reviews = response.data.result.reviews || [];

    if (reviews.length === 0) {
      return res.json({ message: 'No reviews found' });
    }

    logger.info(`Fetched reviews for place ID ${placeId} : ${reviews.length} reviews found`);
    logger.info(` reviews: ${reviews}`);

    // Retourner uniquement l'avis le plus récent
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

module.exports = router;
