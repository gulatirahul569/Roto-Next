import "./globals.css";
import AppProviders from "../context/AppProviders";
import StorefrontShell from "../components/layout/StorefrontShell";

export const metadata = {
  title: "Roto",
  description: "A modern shopping experience.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <StorefrontShell>{children}</StorefrontShell>
        </AppProviders>
      </body>
    </html>
  );
}