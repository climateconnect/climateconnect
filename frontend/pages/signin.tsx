import { GetServerSideProps } from "next";
import { getLocalePrefix } from "../public/lib/apiOperations";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const queryParams = new URLSearchParams();
  if (ctx.query.redirect) queryParams.set("redirect", ctx.query.redirect as string);
  if (ctx.query.hub) queryParams.set("hub", ctx.query.hub as string);

  return {
    redirect: {
      destination: `${getLocalePrefix(ctx.locale || "en")}/login${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`,
      statusCode: 301,
    },
  };
};

export default function Signin() {
  return null;
}
