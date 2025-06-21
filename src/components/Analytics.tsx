"use client";

import { useEffect, useCallback, useRef } from "react";

// Declare gtag function type
declare global {
  interface Window {
    gtag: (
      command: "config" | "event",
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

interface AnalyticsProps {
  pageTitle?: string;
  pagePath?: string;
}

interface TrackingData {
  event: string;
  timestamp: string;
  [key: string]: any;
}

// Analytics configuration
const ANALYTICS_CONFIG = {
  enabled: process.env.NODE_ENV === "production",
  debug: process.env.NODE_ENV === "development",
  maxRetries: 3,
  retryDelay: 1000,
} as const;

export default function Analytics({ pageTitle, pagePath }: AnalyticsProps) {
  const isInitialized = useRef(false);

  // Memoized tracking function with error handling and retries
  const trackEvent = useCallback(
    (eventName: string, eventData?: Record<string, any>) => {
      if (typeof window === "undefined") return;

      const data: TrackingData = {
        event: eventName,
        timestamp: new Date().toISOString(),
        ...eventData,
      };

      // Log in development
      if (ANALYTICS_CONFIG.debug) {
        console.log("Analytics Event:", data);
      }

      // Send to Google Analytics with retry logic
      const sendToGA = (retryCount = 0) => {
        try {
          if (typeof window.gtag !== "undefined") {
            window.gtag("event", eventName, eventData);
          }
        } catch (error) {
          console.error("Analytics error:", error);

          // Retry logic
          if (retryCount < ANALYTICS_CONFIG.maxRetries) {
            setTimeout(() => {
              sendToGA(retryCount + 1);
            }, ANALYTICS_CONFIG.retryDelay * (retryCount + 1));
          }
        }
      };

      sendToGA();
    },
    []
  );

  // Memoized page view tracking
  const trackPageView = useCallback(() => {
    if (typeof window === "undefined") return;

    const data = {
      page: pagePath || window.location.pathname,
      title: pageTitle || document.title,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    // Log in development
    if (ANALYTICS_CONFIG.debug) {
      console.log("Page View:", data);
    }

    // Send to Google Analytics
    try {
      if (typeof window.gtag !== "undefined") {
        window.gtag("config", "GA_MEASUREMENT_ID", {
          page_path: data.page,
          page_title: data.title,
        });
      }
    } catch (error) {
      console.error("Page view tracking error:", error);
    }
  }, [pageTitle, pagePath]);

  // Initialize analytics
  useEffect(() => {
    if (isInitialized.current) return;

    isInitialized.current = true;
    trackPageView();
  }, [trackPageView]);

  // Expose trackEvent function globally for use in other components
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).trackEvent = trackEvent;
    }

    // Cleanup function
    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).trackEvent;
      }
    };
  }, [trackEvent]);

  return null; // This component doesn't render anything
}

// Utility function to track course interactions with validation
export const trackCourseInteraction = (
  courseId: number,
  action: "view" | "click" | "enroll"
) => {
  if (typeof window === "undefined") return;

  // Validate inputs
  if (!courseId || !action) {
    console.warn("Invalid course interaction data:", { courseId, action });
    return;
  }

  if ((window as any).trackEvent) {
    (window as any).trackEvent("course_interaction", {
      course_id: courseId,
      action,
      timestamp: new Date().toISOString(),
    });
  }
};

// Utility function to track form submissions with validation
export const trackFormSubmission = (formName: string, success: boolean) => {
  if (typeof window === "undefined") return;

  // Validate inputs
  if (!formName || typeof success !== "boolean") {
    console.warn("Invalid form submission data:", { formName, success });
    return;
  }

  if ((window as any).trackEvent) {
    (window as any).trackEvent("form_submission", {
      form_name: formName,
      success,
      timestamp: new Date().toISOString(),
    });
  }
};

// Additional utility functions for enhanced tracking
export const trackButtonClick = (buttonName: string, location?: string) => {
  if (typeof window === "undefined") return;

  if ((window as any).trackEvent) {
    (window as any).trackEvent("button_click", {
      button_name: buttonName,
      location: location || window.location.pathname,
      timestamp: new Date().toISOString(),
    });
  }
};

export const trackScrollDepth = (depth: number) => {
  if (typeof window === "undefined") return;

  if ((window as any).trackEvent) {
    (window as any).trackEvent("scroll_depth", {
      depth,
      timestamp: new Date().toISOString(),
    });
  }
};
