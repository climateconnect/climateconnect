const fallback_values = {
  API_URL: "https://climateconnect-backend.azurewebsites.net/",
  SOCKET_URL: "wss://limateconnect-backend.azurewebsites.net",
  ENVIRONMENT: "production"
}

export default function getEnvVar({ name }) {
  if(process.env[name])
    return process.env[name]
  else
    return fallback_values[name]
}