// Use Netlify proxy path so frontend and backend communicate same-origin.
// Netlify redirects in `netlify.toml` forward `/api/*` to the production backend.
const API_BASE_URL = '/api';

export default API_BASE_URL;
