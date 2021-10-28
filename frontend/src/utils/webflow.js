import axios from "axios";
import cheerio from "cheerio";

const retrievePage = async (url) => {
  const res = await axios.get(url).catch((err) => {
    console.error(err);
  });
  const html = res.data;

  // Parse HTML with Cheerio
  const $ = await cheerio.load(html);
  const bodyContent = $(`body`).html();
  const headContent = $(`head`).html();

  return {
    bodyContent: bodyContent,
    headContent: headContent,
  };
};

export { retrievePage };
