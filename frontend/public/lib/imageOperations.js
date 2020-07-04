export function getImageUrl(url){
  if(!url)
    return
  return process.env.API_URL+url
}