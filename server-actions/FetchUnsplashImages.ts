"use server";

interface UnsplashImage {
  urls: {
    regular: string;
  };
}

export async function fetchUnsplashImages(query: string): Promise<string[]> {
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

  // If no API key is configured, return mock data for development
  if (!UNSPLASH_ACCESS_KEY) {
    console.log("No Unsplash API key configured, returning mock data");
    return getMockImages(query);
  }

  const url = `https://api.unsplash.com/search/photos?page=1&query=${encodeURIComponent(query)}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(
        `Failed to fetch images: ${res.status} ${res.statusText}`,
      );
    }

    const data = await res.json();
    return data.results.map((image: UnsplashImage) => image.urls.regular);
  } catch (error) {
    console.error("Error fetching Unsplash images:", error);

    // If it's an SSL error, suggest the workaround
    if (error instanceof Error && error.message.includes('certificate')) {
      console.log("SSL certificate error detected. The app will use mock images for development.");
      console.log("To use real Unsplash images, configure proper SSL certificates or use a different network.");
    }

    // Return mock data as fallback
    console.log("Returning mock data as fallback");
    return getMockImages(query);
  }
}

// Mock images for development/testing when API is unavailable
function getMockImages(query: string): string[] {
  const mockImages = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
    "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=800",
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
    "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=800",
  ];

  // Return a subset based on query to simulate search results
  const queryHash = query.toLowerCase().split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);

  const startIndex = Math.abs(queryHash) % mockImages.length;
  const numImages = Math.min(6, mockImages.length - startIndex);

  return mockImages.slice(startIndex, startIndex + numImages);
}
