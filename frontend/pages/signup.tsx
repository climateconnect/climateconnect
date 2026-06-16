import { GetServerSideProps } from "next";
import { getLocalePrefix } from "../public/lib/apiOperations";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const queryParams = new URLSearchParams();
  if (ctx.query.redirect) queryParams.set("redirect", ctx.query.redirect as string);
  if (ctx.query.hub) queryParams.set("hub", ctx.query.hub as string);
  if (ctx.query.message) queryParams.set("message", ctx.query.message as string);
  if (ctx.query.message_type) queryParams.set("message_type", ctx.query.message_type as string);

  return {
    redirect: {
      destination: `${getLocalePrefix(ctx.locale || "en")}/login${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`,
      statusCode: 301,
    },
  };
};

export default function Signup() {
  return null;
}
