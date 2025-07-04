import HomeClient from "./HomeClient";
import { Metadata } from "next";

const allImages = [
  "/img1.jpg",
  "/img2.jpg",
  "/img3.jpg",
  "/img4.jpg",
  "/img5.jpg",
  "/img6.jpg",
  "/img7.jpg",
  "/img9.jpg",
  "/img10.jpg",
  "/img11.jpg",
];

// Fisher-Yates shuffle (server-side)
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Metadata for SEO
export const metadata = {
  title: "MitrLok - Connect with Friends Sharing Your Interests",
  description:
    "Discover friendships in your city around coding, cricket, coffee, and conversations with MitrLok. Join now and explore your circle!",
  openGraph: {
    title: "MitrLok - Connect with Friends Sharing Your Interests",
    description:
      "Discover friendships in your city around coding, cricket, coffee, and conversations with MitrLok. Join now and explore your circle!",
    url: "https://yourdomain.com",
    siteName: "MitrLok",
    images: [
      {
        url: "/img1.jpg",
        width: 800,
        height: 600,
        alt: "MitrLok community image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MitrLok - Connect with Friends Sharing Your Interests",
    description:
      "Discover friendships in your city around coding, cricket, coffee, and conversations with MitrLok. Join now and explore your circle!",
    images: ["/img1.jpg"],
  },
};

export default function Page() {
  const images = shuffle(allImages).slice(0, 6);
  return <HomeClient initialImages={images} allImages={allImages} />;
}
