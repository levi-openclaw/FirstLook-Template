import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Content Intelligence Dashboard",
  description: "Social media content analysis and performance intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-framer-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('firstlook-theme');if(t==='dark'){document.documentElement.setAttribute('data-framer-theme','dark')}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
