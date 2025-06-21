"use client";
import Image from "next/image";
import React, { useMemo, useState, useCallback } from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import courseData from "@/data/music_course.json";

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  instructor: string;
  isFeatured: boolean;
  image: string;
}

// Error boundary component
const CoursesErrorFallback = () => (
  <div className="min-h-screen bg-black py-12 pt-36">
    <div className="text-center">
      <h1 className="text-2xl md:text-4xl text-white mb-4">
        Error Loading Courses
      </h1>
      <p className="text-gray-400">
        Unable to load courses. Please try refreshing the page.
      </p>
    </div>
  </div>
);

// Loading component
const CoursesLoading = () => (
  <div className="min-h-screen bg-black py-12 pt-36">
    <div className="text-center">
      <h1 className="text-2xl md:text-4xl text-white mb-4">
        Loading Courses...
      </h1>
      <div className="flex justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  </div>
);

function CoursesPage() {
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "price" | "instructor">("name");

  // Memoized courses with error handling and validation
  const courses = useMemo(() => {
    try {
      if (!courseData?.courses || !Array.isArray(courseData.courses)) {
        throw new Error("Invalid course data structure");
      }

      return courseData.courses.filter((course: Course) => {
        // Validate course data
        if (!course || typeof course !== "object") return false;
        if (!course.id || !course.title || !course.slug || !course.image)
          return false;
        return true;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return [];
    }
  }, []);

  // Memoized filtered and sorted courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = courses;

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(term) ||
          course.description.toLowerCase().includes(term) ||
          course.instructor.toLowerCase().includes(term)
      );
    }

    // Filter by instructor
    if (selectedInstructor !== "all") {
      filtered = filtered.filter(
        (course) => course.instructor === selectedInstructor
      );
    }

    // Sort courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title);
        case "price":
          return a.price - b.price;
        case "instructor":
          return a.instructor.localeCompare(b.instructor);
        default:
          return 0;
      }
    });

    return filtered;
  }, [courses, searchTerm, selectedInstructor, sortBy]);

  // Memoized unique instructors
  const instructors = useMemo(() => {
    const uniqueInstructors = new Set(
      courses.map((course) => course.instructor)
    );
    return Array.from(uniqueInstructors).sort();
  }, [courses]);

  // Handle course click tracking
  const handleCourseClick = useCallback(
    (course: Course, action: "view" | "enroll") => {
      try {
        if (typeof window !== "undefined" && (window as any).trackEvent) {
          (window as any).trackEvent("course_interaction", {
            course_id: course.id,
            course_title: course.title,
            action,
            location: "courses_page",
            timestamp: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn("Failed to track course interaction:", err);
      }
    },
    []
  );

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  // Handle instructor filter change
  const handleInstructorChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedInstructor(e.target.value);
    },
    []
  );

  // Handle sort change
  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSortBy(e.target.value as "name" | "price" | "instructor");
    },
    []
  );

  // Show error state
  if (error) {
    return <CoursesErrorFallback />;
  }

  // Show loading state if no courses
  if (courses.length === 0) {
    return <CoursesLoading />;
  }

  return (
    <div className="min-h-screen bg-black py-12 pt-36">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-lg md:text-7xl text-center font-sans font-bold mb-8 text-white">
          All Courses ({filteredAndSortedCourses.length})
        </h1>

        {/* Search and Filter Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-64"
          />

          <select
            value={selectedInstructor}
            onChange={handleInstructorChange}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Instructors</option>
            {instructors.map((instructor) => (
              <option key={instructor} value={instructor}>
                {instructor}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={handleSortChange}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="instructor">Sort by Instructor</option>
          </select>
        </div>

        {/* Results count */}
        {searchTerm || selectedInstructor !== "all" ? (
          <div className="text-center mb-6">
            <p className="text-gray-400">
              Showing {filteredAndSortedCourses.length} of {courses.length}{" "}
              courses
            </p>
          </div>
        ) : null}

        {/* Courses Grid */}
        <div className="flex flex-wrap justify-center gap-6">
          {filteredAndSortedCourses.map((course, index) => (
            <CardContainer key={course.id} className="inter-var">
              <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border">
                <CardItem
                  translateZ="50"
                  className="text-xl font-bold text-neutral-600 dark:text-white"
                >
                  {course.title}
                </CardItem>

                <CardItem
                  as="p"
                  translateZ="60"
                  className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                >
                  {course.description}
                </CardItem>

                <CardItem
                  as="p"
                  translateZ="70"
                  className="text-teal-600 text-sm mt-2 font-medium"
                >
                  Instructor: {course.instructor}
                </CardItem>

                <CardItem
                  as="p"
                  translateZ="80"
                  className="text-lg font-bold text-black dark:text-white mt-2"
                >
                  ${course.price}
                </CardItem>

                <CardItem translateZ="100" className="w-full mt-4">
                  <Image
                    src={course.image}
                    height="1000"
                    width="1000"
                    className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
                    alt={course.title}
                    priority={index < 3} // Prioritize first 3 images
                  />
                </CardItem>

                <div className="flex justify-between items-center mt-6">
                  <CardItem
                    translateZ={20}
                    as="button"
                    className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleCourseClick(course, "view")}
                  >
                    Learn More →
                  </CardItem>
                  <CardItem
                    translateZ={20}
                    as="button"
                    className="px-4 py-2 rounded-xl bg-teal-600 dark:bg-teal-500 text-white text-xs font-bold hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors"
                    onClick={() => handleCourseClick(course, "enroll")}
                  >
                    Enroll Now
                  </CardItem>
                </div>
              </CardBody>
            </CardContainer>
          ))}
        </div>

        {/* No results message */}
        {filteredAndSortedCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              No courses found matching your criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedInstructor("all");
              }}
              className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CoursesPage;
