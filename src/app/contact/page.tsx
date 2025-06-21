"use client";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { useState, useRef, useCallback, useMemo } from "react";
import { trackFormSubmission } from "@/components/Analytics";
import ReCAPTCHA from "react-google-recaptcha";
import emailjs from "@emailjs/browser";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validation rules
const VALIDATION_RULES = {
  name: {
    minLength: 2,
    maxLength: 50,
    required: true,
  },
  email: {
    required: true,
    pattern: EMAIL_REGEX,
  },
  subject: {
    minLength: 5,
    maxLength: 100,
    required: true,
  },
  message: {
    minLength: 10,
    maxLength: 1000,
    required: true,
  },
} as const;

// Type for validation rules
type ValidationRule = {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
};

function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errors, setErrors] = useState<FormErrors>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // Memoized validation function
  const validateField = useCallback(
    (name: keyof ContactFormData, value: string): string | undefined => {
      const rule = VALIDATION_RULES[name] as ValidationRule;

      if (rule.required && !value.trim()) {
        return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
      }

      if (value.trim()) {
        if (rule.minLength && value.trim().length < rule.minLength) {
          return `${
            name.charAt(0).toUpperCase() + name.slice(1)
          } must be at least ${rule.minLength} characters`;
        }

        if (rule.maxLength && value.trim().length > rule.maxLength) {
          return `${
            name.charAt(0).toUpperCase() + name.slice(1)
          } must be less than ${rule.maxLength} characters`;
        }

        if (name === "email" && rule.pattern && !rule.pattern.test(value)) {
          return "Please enter a valid email address";
        }
      }

      return undefined;
    },
    []
  );

  // Memoized form validation
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof ContactFormData;
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  // Memoized form submission handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      setSubmitStatus("idle");

      try {
        // Prepare email template parameters
        const templateParams = {
          from_name: formData.name.trim(),
          from_email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          timestamp: new Date().toISOString(),
          user_agent:
            typeof window !== "undefined" ? navigator.userAgent : "Unknown",
        };

        // Send email using EmailJS
        const result = await emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
          templateParams,
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
        );

        if (result.status === 200) {
          // Track successful submission
          trackFormSubmission("contact_form_secure", true);

          // Reset form
          setSubmitStatus("success");
          setFormData({ name: "", email: "", subject: "", message: "" });
          setErrors({});

          // Reset reCAPTCHA
          recaptchaRef.current?.reset();
          setCaptchaToken(null);

          // Auto-hide success message after 5 seconds
          setTimeout(() => setSubmitStatus("idle"), 5000);
        } else {
          throw new Error("Failed to send message");
        }
      } catch (error: any) {
        console.error("Error submitting form:", error);

        // Track failed submission
        trackFormSubmission("contact_form_secure", false);

        // Set error status and message
        setSubmitStatus("error");
        setErrors({
          message:
            error.message || "An unexpected error occurred. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateForm]
  );

  // Memoized input change handler
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      const fieldName = name as keyof ContactFormData;

      // Update form data
      setFormData((prev) => ({ ...prev, [fieldName]: value }));

      // Clear error for this field if it exists
      if (errors[fieldName]) {
        setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
      }
    },
    [errors]
  );

  // Memoized reCAPTCHA change handler
  const handleCaptchaChange = useCallback((token: string | null) => {
    setCaptchaToken(token);
  }, []);

  // Memoized computed values
  const isFormValid = useMemo(() => {
    return (
      Object.keys(errors).length === 0 &&
      Object.values(formData).every((value) => value.trim().length > 0)
    );
  }, [errors, formData]);

  return (
    <div className="min-h-screen w-full rounded-md bg-neutral-950 relative flex flex-col items-center justify-center antialiased pointer-events-auto py-20">
      <div className="max-w-2xl mx-auto p-4 w-full">
        <h1 className="relative z-10 text-lg md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 mt-20 mb-6 to-neutral-600 text-center font-sans font-bold">
          Contact Us
        </h1>

        <p className="text-neutral-500 max-w-lg mx-auto my-2 text-base text-center relative z-10 mb-8">
          We're here to help you with any questions about our courses, programs,
          or events. Reach out and let us know how we can assist you in your
          musical journey.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              Your Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              maxLength={VALIDATION_RULES.name.maxLength}
              className={`w-full px-4 py-3 rounded-lg border bg-neutral-950 placeholder:text-neutral-600 text-white transition-colors ${
                errors.name
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-neutral-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
              className={`w-full px-4 py-3 rounded-lg border bg-neutral-950 placeholder:text-neutral-600 text-white transition-colors ${
                errors.email
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-neutral-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Subject Field */}
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="What is this about?"
              maxLength={VALIDATION_RULES.subject.maxLength}
              className={`w-full px-4 py-3 rounded-lg border bg-neutral-950 placeholder:text-neutral-600 text-white transition-colors ${
                errors.subject
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-neutral-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              }`}
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
            )}
          </div>

          {/* Message Field */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={5}
              maxLength={VALIDATION_RULES.message.maxLength}
              placeholder="Tell us more about your inquiry..."
              className={`w-full px-4 py-3 rounded-lg border bg-neutral-950 placeholder:text-neutral-600 text-white transition-colors resize-none ${
                errors.message &&
                !errors.name &&
                !errors.email &&
                !errors.subject
                  ? "border-red-500 focus:ring-red-500"
                  : "border-neutral-800 focus:ring-2 focus:ring-teal-500"
              }`}
            />
            {errors.message &&
              !errors.name &&
              !errors.email &&
              !errors.subject && (
                <p className="mt-1 text-sm text-red-500">{errors.message}</p>
              )}
          </div>

          {/* reCAPTCHA Component */}
          <div className="flex justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
              onChange={handleCaptchaChange}
              theme="dark"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
              isSubmitting || !isFormValid
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 hover:shadow-lg active:scale-95"
            } text-white`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Sending...
              </div>
            ) : (
              "Send Message"
            )}
          </button>

          {/* Status Messages */}
          {submitStatus === "success" && (
            <div className="p-4 bg-green-900/20 border border-green-500 rounded-lg text-center">
              <p className="text-green-400">
                ✅ Thank you! Your message has been sent successfully.
              </p>
            </div>
          )}

          {submitStatus === "error" && (
            <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg text-center">
              <p className="text-red-400">
                ❌ {errors.message || "Something went wrong. Please try again."}
              </p>
            </div>
          )}
        </form>

        <BackgroundBeams />
      </div>
    </div>
  );
}

export default ContactPage;
