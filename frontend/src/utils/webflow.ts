import axios from "axios";
import cheerio from "cheerio";

const retrievePage = async (url: string) => {
  const res = await axios.get(url).catch((err) => {
    console.error(err);
  });
  if (!res) throw Error("error caught but not handled");
  const html = res.data;

  // Parse HTML with Cheerio
  const $ = await cheerio.load(html);
  const bodyContent = $(`body`).html();
  const headContent = $(`head`).html();
  const title = $('title').text();
  const description = $('meta[name="description"]').attr('content')

  return {
    bodyContent: bodyContent,
    headContent: headContent,
    title: title,
    description: description
  };
};

export { retrievePage };
