import axios from 'axios';

const sendChatMessage = async (message) => {
  return axios.post('http://localhost:5000/chat', { message });
};

export default sendChatMessage;
