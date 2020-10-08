const fallback_values = {
  API_URL: "https://climateconnect-backend.azurewebsites.net/",
  SOCKET_URL: "wss://limateconnect-backend.azurewebsites.net",
  ENVIRONMENT: "production"
}

export default function getEnvVar(name) {
  console.log("getting env var:"+name)
  if(process.env[name]){
    console.log("getting from process.env")
    return process.env[name]
  }else{
    console.log("getting from fallback_values")
    return fallback_values[name]
  }
}