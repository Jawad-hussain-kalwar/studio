import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Enhanced scrollbar visibility during scrolling and hover
let scrollTimeout: number;
const scrollableElements = new Set<Element>();

const showScrollbars = (element: Element) => {
  element.classList.add('scrolling');
  scrollableElements.add(element);
};

const hideScrollbars = (element: Element) => {
  element.classList.remove('scrolling');
  scrollableElements.delete(element);
};

const handleScroll = (e: Event) => {
  const element = e.target as Element;
  showScrollbars(element);
  
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    hideScrollbars(element);
  }, 1500); // Longer timeout for better UX
};

const handleMouseEnter = (e: Event) => {
  const element = e.target as Element;
  // Only show if element is scrollable
  if (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth) {
    element.classList.add('scrollbar-hover');
  }
};

const handleMouseLeave = (e: Event) => {
  const element = e.target as Element;
  element.classList.remove('scrollbar-hover');
};

// Add scroll listeners to show scrollbars during active scrolling
document.addEventListener('scroll', handleScroll, true);
document.addEventListener('wheel', handleScroll, true);
document.addEventListener('mouseenter', handleMouseEnter, true);
document.addEventListener('mouseleave', handleMouseLeave, true);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
