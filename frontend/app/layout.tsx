import { Metadata } from "next";
import { AppProviders } from "./providers";
import "react-multi-carousel/lib/styles.css";
import "@/devlink/global.css";
import { DevLinkProvider } from "../devlink/DevLinkProvider";

export const metadata: Metadata = {
  title: "Climate Connect",
  description: "Connect for climate action",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <DevLinkProvider>
          <AppProviders>{children}</AppProviders>
        </DevLinkProvider>
      </body>
    </html>
  );
}
