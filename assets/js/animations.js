// Set initial state for timer
document.addEventListener("DOMContentLoaded", function () {
  // Add timer-hidden class initially
  document.querySelector(".sticky-container1").classList.add("timer-hidden");

  // Set initial transform to avoid flash
  anime.set(".sticky-container1", {
    translateY: "-100%",
    opacity: 0,
  });

  // Remove redundant observer that was causing duplicate animations
  // We'll let the main section transitions handle animations instead

  // Initialize other sections for later animation
  anime.set(["#start-quiz", "#unaccepted", "#after-quiz", "#final-page"], {
    opacity: 0,
    translateY: 20,
  });

  // Add entrance animations for comments and footer
  anime.set(".comments", {
    opacity: 0,
    translateY: 25,
    scale: 0.98,
  });

  anime({
    targets: ".comments",
    opacity: 1,
    translateY: 0,
    scale: 1,
    duration: 700,
    easing: "easeOutCubic",
    delay: 600,
  });

  anime.set(".footer-section", {
    opacity: 0,
    translateY: 20,
    scale: 0.98,
  });

  anime({
    targets: ".footer-section",
    opacity: 1,
    translateY: 0,
    scale: 1,
    duration: 700,
    easing: "easeOutCubic",
    delay: 800,
  });

  // Simplify section transition handling
  setupSectionTransitions();

  // Add special handlers for all dynamic sections to fix visibility issues
  ["after-quiz", "final-page", "unaccepted"].forEach(function (sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      // Create a mutation observer for the section
      const sectionObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.attributeName === "class") {
            const classList = section.classList;
            if (
              !classList.contains("d-none") &&
              section.style.opacity !== "1"
            ) {
              // Section is now visible but not yet animated - animate it once
              anime({
                targets: "#" + sectionId,
                opacity: 1,
                translateY: 0,
                scale: 1,
                duration: 600,
                easing: "easeOutCubic",
              });

              // Section-specific animations
              handleSectionSpecificAnimations(sectionId);
            }
          }
        });
      });

      // Start observing
      sectionObserver.observe(section, { attributes: true });
    }
  });

  // Handle comment sorting functionality
  const sortCommentsSelect = document.getElementById("sort-comments");
  if (sortCommentsSelect) {
    sortCommentsSelect.addEventListener("change", function () {
      sortComments(this.value);
    });

    // Trigger sort on page load with initial value
    sortComments(sortCommentsSelect.value);

    // Initialize the comment buttons
    initializeCommentButtons();
  }
});

// Function to sort comments based on selected option
function sortComments(sortBy) {
  const commentsContainer = document.querySelector(".main-comments");
  const comments = Array.from(
    commentsContainer.querySelectorAll(".comment:not(.d-none)")
  );

  if (comments.length === 0) return; // No comments to sort

  comments.sort((a, b) => {
    switch (sortBy) {
      case "newest":
        // Sort by date (newest first)
        // Convert time strings to comparable values - simple parsing for demo
        const timeA = parseTimeAgo(
          a.querySelector(".comment-time").textContent
        );
        const timeB = parseTimeAgo(
          b.querySelector(".comment-time").textContent
        );
        return timeB - timeA; // Newest first (larger values first)

      case "oldest":
        // Sort by date (oldest first)
        const timeC = parseTimeAgo(
          a.querySelector(".comment-time").textContent
        );
        const timeD = parseTimeAgo(
          b.querySelector(".comment-time").textContent
        );
        return timeC - timeD; // Oldest first (smaller values first)

      case "most-liked":
        // Sort by likes count
        const likesA =
          parseInt(
            a.querySelector(".comment-likes").textContent.match(/\d+/)[0]
          ) || 0;
        const likesB =
          parseInt(
            b.querySelector(".comment-likes").textContent.match(/\d+/)[0]
          ) || 0;
        return likesB - likesA; // Most likes first

      default:
        return 0;
    }
  });

  // Remove all comments and re-append in sorted order
  comments.forEach((comment) => {
    commentsContainer.removeChild(comment);
  });

  comments.forEach((comment) => {
    commentsContainer.appendChild(comment);
  });

  // Add a nice animation effect to sorted comments
  anime({
    targets: ".comment:not(.d-none)",
    translateY: [5, 0],
    opacity: [0.8, 1],
    delay: anime.stagger(100),
    duration: 300,
    easing: "easeOutCubic",
  });

  // Reinitialize comment buttons after sorting
  initializeCommentButtons();
}

// Helper function to convert time ago strings to numeric values for sorting
function parseTimeAgo(timeString) {
  const hours = timeString.match(/(\d+)\s*hour/);
  const days = timeString.match(/(\d+)\s*day/);

  if (hours) {
    return parseInt(hours[1]);
  } else if (days) {
    return parseInt(days[1]) * 24;
  }
  return 0;
}

// Function to animate the timer sliding in from the top and pushing content down
function animateTimerIn() {
  // First remove the timer-hidden class
  document.querySelector(".sticky-container1").classList.remove("timer-hidden");

  // Get the actual height of the timer for accurate animation
  const timerHeight = document.querySelector(".timer").offsetHeight;

  // Create a timeline for coordinated animations
  const timeline = anime.timeline({
    easing: "easeOutExpo",
  });

  // Add timer animation that pushes content down
  timeline
    .add({
      targets: ".sticky-container1",
      translateY: ["-100%", 0],
      opacity: [0, 1],
      height: [0, timerHeight], // Use actual height
      duration: 800,
      easing: "easeOutCubic",
      begin: function () {
        // Ensure timer is visible before animation
        document.querySelector(".sticky-container1").style.display = "block";
      },
    })
    // Then add slight downward movement to the rest of the page content
    .add(
      {
        targets: "header, .sections-wrapper",
        translateY: [0, 0], // Changed from [0, timerHeight] to [0, 0] to prevent double spacing
        duration: 600,
        easing: "easeOutCubic",
      },
      "-=800"
    ); // Start at the same time

  return timeline;
}

// Handle section-specific animations (centralized in one place)
function handleSectionSpecificAnimations(sectionId) {
  switch (sectionId) {
    case "unaccepted":
      anime({
        targets: "#unaccepted .unaccepted-modal",
        scale: [0.95, 1],
        opacity: [0, 1],
        duration: 600,
        easing: "easeOutCubic",
      });
      break;

    case "after-quiz":
      // Animate title and subtitle
      anime({
        targets: "#after-quiz .loading-title, #after-quiz .loading-subtitle",
        opacity: [0, 1],
        translateY: [15, 0],
        duration: 600,
        easing: "easeOutCubic",
        delay: anime.stagger(150),
      });

      // Animate loading items one by one
      anime({
        targets: "#after-quiz .loading-item",
        opacity: [0, 1],
        translateX: [-15, 0],
        duration: 600,
        easing: "easeOutCubic",
        delay: anime.stagger(300, { start: 300 }),
      });
      break;

    case "final-page":
      anime({
        targets: "#final-page .final-page-title",
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 600,
        easing: "easeOutCubic",
      });

      anime({
        targets: "#final-page p, #final-page .image-container",
        opacity: [0, 1],
        translateY: [15, 0],
        duration: 600,
        easing: "easeOutCubic",
        delay: anime.stagger(100, { start: 200 }),
      });

      anime({
        targets: "#final-page ol li",
        opacity: [0, 1],
        translateX: [15, 0],
        duration: 600,
        easing: "easeOutCubic",
        delay: anime.stagger(150, { start: 400 }),
      });

      anime({
        targets: "#final-page .continue-button",
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 700,
        easing: "easeOutCubic",
        delay: 800,
      });
      break;

    case "start-quiz":
      // Animate question counter separately
      anime({
        targets: "#question-counter",
        opacity: [0, 1],
        translateX: [-50, 0],
        duration: 600,
        easing: "easeOutQuad",
        delay: 300,
      });

      // Set up an observer specifically for quiz content
      const quizModelsObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            // Check if quiz content has been added and not already animated
            const quizQuestion = document.querySelector(
              "#quiz-models .quiz-question"
            );
            const quizAnswers = document.querySelectorAll(
              "#quiz-models .quiz-answer"
            );

            if (quizQuestion && !quizQuestion.hasAttribute("data-animated")) {
              // Animate the question
              anime({
                targets: quizQuestion,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 800,
                easing: "easeOutQuad",
              });
              quizQuestion.setAttribute("data-animated", "true");
            }

            if (
              quizAnswers.length > 0 &&
              !quizAnswers[0].hasAttribute("data-animated")
            ) {
              // Animate the answers with staggered delay
              anime({
                targets: quizAnswers,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 800,
                easing: "easeOutQuad",
                delay: anime.stagger(150),
              });
              quizAnswers.forEach((answer) => {
                answer.setAttribute("data-animated", "true");
              });
            }
          }
        });
      });

      // Start observing quiz-models for changes
      const quizModels = document.getElementById("quiz-models");
      if (quizModels) {
        quizModelsObserver.observe(quizModels, {
          childList: true,
          subtree: true,
        });
      }
      break;
  }
}

// Function to animate check marks when they are added to the DOM
function animateCheckmark(element) {
  anime({
    targets: element,
    scale: [0, 1],
    opacity: [0, 1],
    rotate: [45, 0],
    duration: 800,
    easing: "easeOutElastic(1, 0.5)",
  });
}

// Create a mutation observer to watch for added check marks
document.addEventListener("DOMContentLoaded", function () {
  const loadingContainer = document.querySelector(".loading-container");
  if (loadingContainer) {
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach(function (node) {
            if (
              node.nodeType === 1 &&
              node.classList &&
              node.classList.contains("material-icons")
            ) {
              // Animate the newly added check mark
              animateCheckmark(node);
            }
          });
        }
      });
    });

    // Start observing the loading container for added nodes
    observer.observe(loadingContainer, {
      childList: true,
      subtree: true,
    });
  }
});

// Header entrance animation
document.addEventListener("DOMContentLoaded", function () {
  // Initially hide header
  anime.set("header", {
    opacity: 0,
    translateY: -20,
  });

  // Animate header entrance
  anime({
    targets: "header",
    opacity: 1,
    translateY: 0,
    duration: 700,
    easing: "easeOutCubic",
    delay: 200,
  });

  // Initial section entrance animation
  anime.set("#before-quiz", {
    opacity: 0,
    translateY: 15,
    scale: 0.98,
  });

  anime({
    targets: "#before-quiz",
    opacity: 1,
    translateY: 0,
    scale: 1,
    duration: 700,
    easing: "easeOutCubic",
    delay: 400,
  });
});

// Set up simplified section transitions to avoid duplicate animations
function setupSectionTransitions() {
  // Store previous functions to call if they exist
  const originalShowSection = window.showSection;

  // Create simplified section transition function that doesn't duplicate animations
  window.showSection = function (sectionToShow) {
    // Find current visible section
    let currentSection = null;
    document.querySelectorAll(".content-section").forEach(function (section) {
      if (!section.classList.contains("d-none")) {
        currentSection = section.id;
      }
    });

    // Hide all sections first
    document.querySelectorAll(".content-section").forEach(function (section) {
      section.classList.add("d-none");
      section.style.opacity = "0";
    });

    // Show the requested section
    const targetSection = document.getElementById(sectionToShow);
    targetSection.classList.remove("d-none");

    // Reset animation state for new section
    anime.set("#" + sectionToShow, {
      opacity: 0,
      translateY: 20,
      scale: 0.98,
    });

    // Call original showSection if it exists
    if (typeof originalShowSection === "function") {
      originalShowSection(sectionToShow);
    }
  };
}

// Logo animation
let logoRotations = 0;

// Make FAQ button interactive
document.getElementById("faq-trigger").addEventListener("click", function () {
  anime({
    targets: this,
    scale: [
      { value: 1.2, duration: 100, easing: "easeInOutQuad" },
      { value: 1, duration: 200, easing: "easeOutElastic(1, .5)" },
    ],
  });
});

// Add animations to START button
const startButton = document.getElementById("start-quiz-button");
if (startButton) {
  // Continuous bounce animation for START button
  anime({
    targets: startButton,
    scale: [
      { value: 1.1, duration: 500, easing: "easeInOutCubic" },
      { value: 1, duration: 500, easing: "easeOutElastic(1, .5)" },
    ],
    loop: true,
    direction: "alternate",
    easing: "easeInOutQuad",
    loopComplete: function (anim) {
      // Ensure animation continues infinitely without delay
      anim.play();
    },
    loopBegin: function (anim) {
      // Ensure animation stays active
      if (!anim.began) anim.begin();
    },
  });

  // Hover animations are no longer needed since we have the continuous bounce
  // but we'll pause the bounce and apply a more dramatic scale on hover
  startButton.addEventListener("mouseenter", function () {
    // Get the running animation and pause it
    const runningAnimation = anime.running[0];
    if (runningAnimation) runningAnimation.pause();

    anime({
      targets: this,
      scale: 1.2,
      duration: 300,
      easing: "easeOutElastic(1, .5)",
    });
  });

  startButton.addEventListener("mouseleave", function () {
    // Resume the paused animation
    const runningAnimation = anime.running[0];
    if (runningAnimation) runningAnimation.play();

    anime({
      targets: this,
      scale: 1,
      duration: 200,
      easing: "easeOutQuad",
    });
  });
}

// Function to initialize comment buttons - can be called whenever comments change
function initializeCommentButtons() {
  // Remove existing event listeners (to prevent duplicates)
  document
    .querySelectorAll(".comment:not(.d-none) .comment-action")
    .forEach((button) => {
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
    });

  // Add new event listeners
  document
    .querySelectorAll(".comment:not(.d-none) .comment-action")
    .forEach((button) => {
      button.addEventListener("click", function () {
        // Animate the button when clicked
        anime({
          targets: this,
          scale: [1, 1.2, 1],
          duration: 300,
          easing: "easeInOutQuad",
        });

        // If it's a like button, increment the count for demonstration
        if (this.title === "Like") {
          const likesElement =
            this.closest(".comment-actions").querySelector(".comment-likes");
          const currentLikes = parseInt(
            likesElement.textContent.match(/\d+/)[0]
          );
          likesElement.innerHTML = `<i class="material-icons">favorite</i> ${
            currentLikes + 1
          }`;

          // Re-sort if sorted by most-liked
          const sortCommentsSelect = document.getElementById("sort-comments");
          if (sortCommentsSelect && sortCommentsSelect.value === "most-liked") {
            setTimeout(() => sortComments("most-liked"), 300);
          }
        }
      });
    });
}
