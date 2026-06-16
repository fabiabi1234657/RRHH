import axios from 'axios'

// Axios instance preconfigured for frontend with credentials
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
})

export default instance
