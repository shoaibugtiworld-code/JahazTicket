const express = require('express');
const cors = require('cors');
const { Duffel } = require('@duffel/api');

const app = express();
app.use(cors());
app.use(express.json());

// یہاں اپنا Duffel Test Token ڈالیں
const duffel = new Duffel({
  token: 'YOUR_DUFFEL_TEST_TOKEN_HERE'
});

// Flight Search API
app.post('/search-flights', async (req, res) => {
  try {
    const { origin, destination, departure_date } = req.body;

    const offerRequest = await duffel.offerRequests.create({
      slices: [
        {
          origin: origin,
          destination: destination,
          departure_date: departure_date
        }
      ],
      passengers: [{ type: 'adult' }],
      cabin_class: 'economy'
    });

    // صرف ضروری ڈیٹا بھیجیں
    const offers = offerRequest.data.offers.map(offer => ({
      id: offer.id,
      airline: offer.owner.name,
      total_amount: offer.total_amount,
      total_currency: offer.total_currency,
      slices: offer.slices
    }));

    res.json({ success: true, offers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
