const fallback_values = {
  API_URL: "https://api.cc-test-domain.com",
  SOCKET_URL: "wss://climateconnect-backend.azurewebsites.net",
  ENVIRONMENT: "production"
}

export default function getEnvVar(name, env) {
  if(process.env[name]){
    return process.env[name]
  }else{
    return fallback_values[name]
  }
}