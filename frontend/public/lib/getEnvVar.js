const fallback_values = {
  API_URL: "https://cc-test-domain.com",
  SOCKET_URL: "wss://cc-test-domain.com",
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