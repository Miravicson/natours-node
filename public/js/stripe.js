/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51I9fQ5E1eb9BdB71MgGl2gQKsjzfgmo8XYcJ0zZjUtoCLz3vnXk1LOU7JiHTTPxnQymXPrQXYkczH8muH7fjy2H800fThAtNV0'
);

export const bookTour = async (tourId) => {
  // 1) Get checkout session from API
  try {
    const session = await axios.get(
      `/api/v1/bookings/checkout-session/${tourId}`
    );
    logger.info(session);
    // 2) Create checkout form + charge credit card

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });

    showAlert('success', 'Tour booked successfully');
  } catch (error) {
    logger.info(error);
    showAlert('error', 'Error booking tour');
  }
};
