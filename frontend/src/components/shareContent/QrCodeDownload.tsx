import { Button } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import DownloadIcon from "@mui/icons-material/Download";
import { toDataURL } from "qrcode";
import React, { useEffect, useState } from "react";

const useStyles = makeStyles(() => ({
  qrImage: {
    display: "block",
    width: 160,
    height: 160,
  },
}));

type QrCodeDownloadProps = {
  url: string;
  fileName: string;
  downloadButtonText: string;
  altText: string;
};

//Renders a QR code linking to the given url. The PNG is generated in print
//quality (1024px) and can be downloaded e.g. for use on flyers and posters.
export default function QrCodeDownload({
  url,
  fileName,
  downloadButtonText,
  altText,
}: QrCodeDownloadProps) {
  const classes = useStyles();
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    toDataURL(url, { width: 1024, margin: 1 })
      .then((result) => setDataUrl(result))
      .catch((error) => console.error(error));
  }, [url]);

  if (!dataUrl) return null;

  return (
    <>
      <img src={dataUrl} className={classes.qrImage} alt={altText} />
      <Button
        variant="contained"
        color="primary"
        href={dataUrl}
        download={fileName}
        startIcon={<DownloadIcon />}
      >
        {downloadButtonText}
      </Button>
    </>
  );
}
