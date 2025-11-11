import { Metadata } from "next";
import { AppProviders } from "./providers";
import "../devlink/global.css";
import "react-multi-carousel/lib/styles.css";

export const metadata: Metadata = {
  title: "Climate Connect",
  description: "Connect for climate action",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
