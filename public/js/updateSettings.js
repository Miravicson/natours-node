/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
import { logout } from './login';

// type is either password or data
export const updateSettings = async (data, type) => {
  let url, onSuccess;
  // Type is password
  if (type === 'password') {
    url = '/api/v1/users/my-password';
    onSuccess = () => {
      showAlert('success', 'You have updated your password.');
    };
  }
  // Type is data
  if (type === 'data') {
    url = '/api/v1/users/me';
    onSuccess = () => {
      showAlert('success', 'You updated your profile details');
      window.setTimeout(() => {
        location.reload(true);
      }, 1000);
    };
  }
  // Make Request
  try {
    const res = await axios({
      method: 'PATCH',
      url,
      data: data,
    });
    if (res.data.status === 'success') {
      onSuccess();
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
