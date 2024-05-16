import axios from "axios";
import { CcLocale } from "../../src/types";

export async function getAllBlogPosts(locale: CcLocale) {
  const api_token = process.env.WEBFLOW_API_TOKEN
  const WEBFLOW_LANGUAGES = {
    de: "e8f987c48323e8e2485564e99263ac0e",
    en: "08ea600611a6f0978326919b604c81c1"
  }
  const res = await axios.get(
    "https://api.webflow.com/v2/collections/62611a5459ba10520c76f67d/items",
    { 
      headers: {
        Authorization: `Bearer ${api_token}`
      }
    }
  )
  const allPosts = res.data.items;
  const postsInCorrectLanguage = allPosts.filter(
    p => p.fieldData.language === WEBFLOW_LANGUAGES[locale]
  )
  if(!postsInCorrectLanguage || postsInCorrectLanguage.length == 0) {
    return []
  }
  return postsInCorrectLanguage.map(p => {
    return {
      url_slug: p.fieldData.slug,
      updated_at: p.lastUpdated
    }
  })
}