const DEVELOPMENT = ["development", "develop", "test"].includes(process.env.ENVIRONMENT)

export function getImageUrl(url){
  if(!url)
    return
  if(DEVELOPMENT){
    console.log(process.env.API_URL+url)
    return process.env.API_URL+url
  }else
    return url
}