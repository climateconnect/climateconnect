const DEVELOPMENT = ["development", "develop", "test"].includes(process.env.ENVIRONMENT);

export function getImageUrl(url) {
  if (!url) return;
  if (DEVELOPMENT && !url.includes("http:") && !url.includes("https:")) {
    return process.env.API_URL + url;
  } else {
    return url;
  }
}

export function getImageDialogHeight(screenWidth) {
  console.log((screenWidth / 16) * 9);
  return (screenWidth / 16) * 9 * 0.7;
}

export async function getResizedImage(blob, width, height, type, forceExactSize) {
  //only resize by factors of 2, otherwise we'll lose quality
  console.log(blob);
  const image = new Image();
  image.src = blob;
  return new Promise(function(resolve) {
    image.onload = async function() {
      if (image.width / 2 > width || image.height / 2 > height) {
        const blob = await getResizedBlob(image, image.width / 2, image.height / 2, type);
        resolve(await getResizedImage(blob, width, height, type, forceExactSize));
      } else if(forceExactSize && image.width>width){
        console.lof("we are forcing the exact size!")
        const blob = await getResizedBlob(image, width, height, type)
        resolve(await getResizedImage(blob, width, height, type, forceExactSize));
      } else {
        resolve(blob);
      }
    };
  });
}

function getResizedBlob(image, width, height, type) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, width, height);
  return new Promise(function(resolve) {
    canvas.toBlob(function(blob) {
      resolve(URL.createObjectURL(blob));
    }, type);
  });
}
