export default function tokenConfig(token: string | undefined, additionalHeaders: object) {
  // Headers
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  // If token, add to headers config
  if (token) {
    config.headers["Authorization"] = `Token ${token}`;
  }

  if (additionalHeaders) {
    for (const headerKey of Object.keys(additionalHeaders)) {
      config.headers[headerKey] = additionalHeaders[headerKey];
    }
  }

  return config;
}
