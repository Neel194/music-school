"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import courseData from "../data/music_course.json";
import { BackgroundGradient } from "./ui/background-gradient";
import { ArrowRight } from "lucide-react";

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  instructor: string;
  isFeatured: boolean;
}

// Error boundary for course data
const CourseErrorFallback = () => (
  <div className="py-12 bg-gray-900">
    <div className="text-center">
      <h2 className="text-base text-red-600 font-semibold tracking-wide uppercase">
        Error Loading Courses
      </h2>
      <p className="mt-2 text-xl text-white">
        Unable to load featured courses. Please try again later.
      </p>
    </div>
  </div>
);

function FeaturedCourses() {
  const [error, setError] = useState<string | null>(null);

  // Memoized featured courses with error handling
  const featuredCourses = useMemo(() => {
    try {
      if (!courseData?.courses || !Array.isArray(courseData.courses)) {
        throw new Error("Invalid course data structure");
      }

      const filtered = courseData.courses.filter((course: Course) => {
        // Validate course data
        if (!course || typeof course !== "object") return false;
        if (!course.id || !course.title || !course.slug) return false;
        return course.isFeatured === true;
      });

      return filtered.slice(0, 6); // Limit to 6 featured courses for better UX
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return [];
    }
  }, []);

  // Handle course click tracking
  const handleCourseClick = (course: Course) => {
    try {
      if (typeof window !== "undefined" && (window as any).trackEvent) {
        (window as any).trackEvent("course_click", {
          course_id: course.id,
          course_title: course.title,
          location: "featured_courses",
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn("Failed to track course click:", err);
    }
  };

  // Handle view all courses click
  const handleViewAllClick = () => {
    try {
      if (typeof window !== "undefined" && (window as any).trackEvent) {
        (window as any).trackEvent("button_click", {
          button_name: "view_all_courses",
          location: "featured_courses",
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn("Failed to track view all click:", err);
    }
  };

  // Show error state
  if (error) {
    return <CourseErrorFallback />;
  }

  // Show loading state if no courses
  if (featuredCourses.length === 0) {
    return (
      <div className="py-12 bg-gray-900">
        <div className="text-center">
          <h2 className="text-base text-teal-600 font-semibold tracking-wide uppercase">
            FEATURED COURSES
          </h2>
          <p className="mt-2 text-xl text-white">Loading featured courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-900">
      <div>
        <div className="text-center">
          <h2 className="text-base text-teal-600 font-semibold tracking-wide uppercase">
            FEATURED COURSES
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
            Learn With the Best
          </p>
          <p className="mt-4 text-lg text-gray-300">
            Discover our most popular courses handpicked for you
          </p>
        </div>
      </div>

      <div className="mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
          {featuredCourses.map((course: Course) => (
            <div key={course.id} className="flex justify-center">
              <BackgroundGradient className="flex flex-col rounded-[22px] bg-white dark:bg-zinc-900 overflow-hidden h-full max-w-sm transition-transform duration-300 hover:scale-105">
                <div className="p-4 sm:p-6 flex flex-col items-center text-center flex-grow">
                  <p className="text-lg sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200 font-semibold">
                    {course.title}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 flex-grow mb-4">
                    {course.description}
                  </p>
                  <div className="w-full space-y-2">
                    <p className="text-sm text-teal-600 font-medium">
                      Instructor: {course.instructor}
                    </p>
                    <p className="text-lg font-bold text-black dark:text-white">
                      ${course.price}
                    </p>
                    <Link
                      className="mt-2 inline-block w-full bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                      href={`/courses/${course.slug}`}
                      onClick={() => handleCourseClick(course)}
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </BackgroundGradient>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-20 text-center">
        <Link
          href="/courses"
          onClick={handleViewAllClick}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition-all duration-300 hover:bg-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 active:scale-95"
        >
          View All Courses <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default FeaturedCourses;
