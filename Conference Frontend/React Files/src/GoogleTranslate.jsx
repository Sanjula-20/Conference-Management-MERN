import React, { useEffect, useRef } from "react";
import "./custom-google-translate.css";

export default function GoogleTranslate() {
  const isInitialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized.current) return;

    // Function to initialize Google Translate
    const initializeGoogleTranslate = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,ta,hi,te,ml,kn,ur,gu,bn,mr,pa",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element"
        );
        isInitialized.current = true;
      }
    };

    // Set up global callback
    window.googleTranslateElementInit = initializeGoogleTranslate;

    // Check if script already exists
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.onerror = () => console.error("Failed to load Google Translate script");
      document.body.appendChild(script);
    } else if (window.google && window.google.translate) {
      // Script already loaded, just initialize
      initializeGoogleTranslate();
    }

    // Cleanup function
    return () => {
      // Note: We don't remove the script on unmount to avoid issues with page translation state
    };
  }, []);

  // Effect to handle URL hash changes from Google Translate
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash.startsWith('#googtrans')) {
        // Remove the Google Translate hash from the URL
        history.replaceState(null, null, window.location.pathname + window.location.search);
      }
    };

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Also check on initial load in case the hash is already there
    handleHashChange();

    // Cleanup
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <div className="inline-block">
      <div
        id="google_translate_element"
        className="max-w-xs p-1"
      />
      <style jsx="true">{`

        .goog-te-banner-frame {
          display: none !important;
        }

        body {
          top: 0 !important;
        }

        /* Style the translate widget */
        #google_translate_element {
          display: inline-block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        .goog-te-gadget {
          font-family: inherit !important;
          font-size: 0.875rem !important;
        }

        .goog-te-gadget-simple {
          background-color: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 0.375rem !important;
          padding: 0.5rem 0.75rem !important;
          font-size: 0.875rem !important;
          transition: all 0.2s ease !important;
        }

        .goog-te-gadget-simple:hover {
          border-color: #3b82f6 !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
        }

        .goog-te-gadget-simple .goog-te-menu-value {
          color: #374151 !important;
        }

        .goog-te-gadget-simple .goog-te-menu-value span {
          color: #3b82f6 !important;
        }

        .goog-te-gadget-icon {
          display: none !important;
        }

        /* Hide the "Powered by" text */
        .goog-te-gadget-simple .goog-te-menu-value span:first-child {
          display: none !important;
        }

        /* Adjust combo box styling */
        .goog-te-combo {
          background-color: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 0.375rem !important;
          padding: 0.5rem !important;
          font-size: 0.875rem !important;
          color: #374151 !important;
          outline: none !important;
        }

        .goog-te-combo:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
      `}</style>
    </div>
  );
}
