// Non-modular main file (all classes in one file)
// Timer functionality
class Timer {
  constructor() {
    this.timerInterval = null;
    this.timeLeft = 180; // 3 minutes in seconds
    this.timerContainer = document.querySelector(".sticky-container1");
    this.timerCount = document.getElementById("timer-count");
    this.timer1 = document.getElementById("timer1");
    this.timerDone = document.getElementById("timer-done");
  }

  // Hide timer initially
  init() {
    // Instead of changing display property, we'll use our class-based approach
    this.timerContainer.classList.add("timer-hidden");
    this.timerContainer.style.display = "none";
  }

  // Show timer
  show() {
    // Make visible but let anime.js handle the animation
    this.timerContainer.style.display = "block";

    // Call the anime.js animation function if it exists
    if (typeof animateTimerIn === "function") {
      // Execute the animation timeline
      animateTimerIn();
    }
  }

  // Start the timer countdown
  start(onTimerExpired) {
    this.timerInterval = setInterval(
      () => this.updateDisplay(onTimerExpired),
      1000
    );
    this.updateDisplay(onTimerExpired); // Update display immediately
  }

  // Update the timer display
  updateDisplay(onTimerExpired) {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;

    this.timerCount.textContent = `${String(minutes).padStart(
      2,
      "0"
    )} MINUTES AND ${String(seconds).padStart(2, "0")} SECONDS`;

    if (this.timeLeft <= 0) {
      this.stop();
      this.timer1.classList.add("d-none");
      this.timerDone.classList.remove("d-none");

      if (onTimerExpired && typeof onTimerExpired === "function") {
        onTimerExpired();
      }
    }
    this.timeLeft--; // Decrement timeLeft
  }

  // Stop the timer
  stop() {
    clearInterval(this.timerInterval);
  }

  // Reset the timer
  reset() {
    this.stop();
    this.timeLeft = 180;

    // Before hiding, get the height to use in animation
    const timerHeight = this.timerContainer.offsetHeight || 0;

    // Hide the timer
    this.timerContainer.style.display = "none";
    this.timerContainer.classList.add("timer-hidden");

    // Reset content positions - move content back up by the timer height
    if (timerHeight > 0) {
      anime({
        targets: "header, .sections-wrapper",
        translateY: 0,
        duration: 300,
        easing: "easeOutQuad",
      });
    }

    this.timer1.classList.remove("d-none");
    this.timerDone.classList.add("d-none");
  }
}

// Quiz functionality
class Quiz {
  constructor() {
    this.quizData = [
      {
        question: "Are you based in the US?",
        description: "We are looking for participants from US and CA only.",
        answer: ["Yes", "No"],
        correctAnswerIndex: 0, // Index of the correct answer
      },
      {
        question: "How often do you shop at Aldi?",
        answer: ["Daily", "Weekly", "Monthly", "Never"],
        correctAnswerIndex: 1,
      },
      {
        question: "How do you usually discover deals and promotions at Aldi?",
        answer: [
          "Store flyers",
          "Social media",
          "Mobile app",
          "Friends/Family",
        ],
        correctAnswerIndex: 2,
      },
    ];

    this.currentQuestionIndex = 0;
    this.isValid = true;
    this.quizContainer = document.getElementById("quiz-models");
    this.questionCounterNumber = document.getElementById(
      "question-counter-number"
    );
    this.animationInProgress = false;
  }

  // Load the current question with animation
  loadQuestion(onAnswerSelect) {
    if (!this.quizContainer) {
      console.error("Quiz container element not found.");
      return;
    }

    if (this.currentQuestionIndex < this.quizData.length) {
      const question = this.quizData[this.currentQuestionIndex];

      // Create new question content
      const newQuestionHTML = `
        <div class="quiz-question" style="opacity: 0; transform: translateY(20px);">${
          question.question
        }</div>
        <div class="quiz-answers">
          ${question.answer
            .map(
              (answer, index) => `
                <div class="quiz-answer" data-answer-index="${index}" style="opacity: 0; transform: translateY(20px);">
                    ${answer}
                </div>
              `
            )
            .join("")}
        </div>
      `;

      // Animation sequence
      if (this.quizContainer.children.length > 0 && !this.animationInProgress) {
        // There's existing content to animate out
        this.animationInProgress = true;

        // Create a new container for the next question
        const nextQuestionContainer = document.createElement("div");
        nextQuestionContainer.classList.add("quiz-next-container");
        nextQuestionContainer.style.position = "absolute";
        nextQuestionContainer.style.top = "0";
        nextQuestionContainer.style.left = "0";
        nextQuestionContainer.style.width = "100%";
        nextQuestionContainer.style.opacity = "0";
        nextQuestionContainer.style.pointerEvents = "none";
        nextQuestionContainer.innerHTML = newQuestionHTML;

        // Insert next to current container
        this.quizContainer.parentNode.insertBefore(
          nextQuestionContainer,
          this.quizContainer.nextSibling
        );

        // Create timeline for transition
        const timeline = anime.timeline({
          easing: "easeOutQuad",
          complete: () => {
            // Replace current container with next container content
            this.quizContainer.innerHTML = newQuestionHTML;
            nextQuestionContainer.remove();

            // Animate new content in
            this.animateQuestionContent();

            // Attach event listeners to the quiz answers
            this.attachAnswerListeners(onAnswerSelect);

            this.animationInProgress = false;
          },
        });

        // Animate current question out
        timeline.add({
          targets: this.quizContainer.querySelectorAll(
            ".quiz-question, .quiz-answer"
          ),
          opacity: [1, 0],
          translateX: [0, -30],
          duration: 400,
          easing: "easeOutQuad",
          delay: anime.stagger(50),
        });

        // Update counter during transition
        this.updateQuestionCounter();
      } else {
        // No existing content or animation in progress, just insert and animate
        this.quizContainer.innerHTML = newQuestionHTML;
        this.updateQuestionCounter();
        this.animateQuestionContent();
        this.attachAnswerListeners(onAnswerSelect);
      }
    } else {
      // If no questions left, return completion status
      if (onAnswerSelect && typeof onAnswerSelect === "function") {
        onAnswerSelect("completed", this.isValid);
      }
    }
  }

  // Animate the question content
  animateQuestionContent() {
    anime({
      targets: this.quizContainer.querySelector(".quiz-question"),
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 500,
      easing: "easeOutQuad",
    });

    anime({
      targets: this.quizContainer.querySelectorAll(".quiz-answer"),
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 500,
      delay: anime.stagger(100, { start: 200 }),
      easing: "easeOutQuad",
    });
  }

  // Update the question counter with animation
  updateQuestionCounter() {
    // First animate counter out
    anime({
      targets: this.questionCounterNumber,
      opacity: [1, 0],
      translateY: [0, -10],
      duration: 200,
      easing: "easeOutQuad",
      complete: () => {
        // Update counter value
        this.questionCounterNumber.textContent = this.currentQuestionIndex + 1;

        // Then animate counter in
        anime({
          targets: this.questionCounterNumber,
          opacity: [0, 1],
          translateY: [10, 0],
          duration: 300,
          easing: "easeOutQuad",
        });
      },
    });
  }

  // Attach listeners to quiz answers
  attachAnswerListeners(onAnswerSelect) {
    document.querySelectorAll(".quiz-answer").forEach((answerElement) => {
      answerElement.addEventListener("click", (event) => {
        // Highlight selected answer with animation
        anime({
          targets: event.target,
          scale: [1, 1.05, 1],
          backgroundColor: [
            "rgba(37, 99, 235, 0.1)",
            "rgba(37, 99, 235, 0.2)",
            "rgba(37, 99, 235, 0.1)",
          ],
          duration: 400,
          easing: "easeOutQuad",
          complete: () => {
            // After animation, handle the answer
            this.handleAnswerClick(event, onAnswerSelect);
          },
        });
      });
    });
  }

  // Handle answer click
  handleAnswerClick(event, onAnswerSelect) {
    if (this.animationInProgress) {
      return; // Prevent action during animation
    }

    const selectedAnswerIndex = parseInt(event.target.dataset.answerIndex);

    // Basic validation - if not valid, prevent proceeding
    if (isNaN(selectedAnswerIndex)) {
      console.error("Invalid answer index.");
      return;
    }

    // Check user qualification based on answers
    if (this.currentQuestionIndex === 0) {
      this.isValid = selectedAnswerIndex === 0; // Means "Yes" was selected for US-based
    }

    if (!this.isValid) {
      // User is not valid, notify callback
      if (onAnswerSelect && typeof onAnswerSelect === "function") {
        onAnswerSelect("invalid", this.isValid);
      }
    } else {
      // Proceed to next question
      this.currentQuestionIndex++;
      this.loadQuestion(onAnswerSelect);
    }
  }

  // Reset the quiz
  reset() {
    this.currentQuestionIndex = 0;
    this.isValid = true;
    if (this.quizContainer) {
      this.quizContainer.innerHTML = "";
    }
  }
}

// Loading functionality with anime.js animations
class LoadingHandler {
  constructor() {
    this.loadingIds = ["loading11", "loading21", "loading31", "loading41"];
  }

  // Add check icons to loading elements in sequence
  async addCheckMarks(onComplete) {
    try {
      const timeline = anime.timeline({
        easing: "easeOutQuad",
        complete: () => {
          if (onComplete && typeof onComplete === "function") {
            // Create final completion animation
            anime({
              targets: ".loading-container",
              scale: [1, 0.95],
              opacity: [1, 0],
              translateY: [0, -10],
              duration: 500,
              easing: "easeOutQuad",
              complete: () => {
                // Call the callback after animation finishes
                onComplete();
              },
            });
          }
        },
      });

      // Pre-animation setup - ensure loading items are visible but with delayed entrance
      this.loadingIds.forEach((id, index) => {
        const el = document.getElementById(id);
        if (el) {
          el.style.opacity = "0";
          el.style.transform = "translateX(-20px)";
        }
      });

      // Animate each loading item in sequence
      this.loadingIds.forEach((id, index) => {
        // Initial entrance animation for text
        timeline.add({
          targets: `#${id}`,
          opacity: [0, 1],
          translateX: [-20, 0],
          duration: 400,
          delay: index * 200,
          easing: "easeOutQuad",
        });

        // Add delay before showing checkmark
        timeline.add({
          duration: 800,
          complete: () => {
            this.showCheckIcon(id);
          },
        });

        // Animate checkmark appearance (will be triggered by showCheckIcon)
        if (index < this.loadingIds.length - 1) {
          timeline.add({
            duration: 200, // Small gap between items
          });
        }
      });
    } catch (error) {
      console.error("Error in addCheckMarks:", error);
    }
  }

  // Show check icon for a loading element
  showCheckIcon(loadingId) {
    const loadingElement = document.getElementById(loadingId);
    if (loadingElement) {
      // Create check icon element
      const checkIcon = document.createElement("i");
      checkIcon.className = "material-icons";
      checkIcon.textContent = "check_circle";
      checkIcon.style.opacity = "0";
      checkIcon.style.transform = "scale(0.5)";

      // Add check icon
      loadingElement.appendChild(checkIcon);

      // Animate the checkmark appearing
      anime({
        targets: checkIcon,
        opacity: [0, 1],
        scale: [0.5, 1.2, 1],
        duration: 600,
        easing: "easeOutElastic(1, 0.5)",
      });

      // Also animate pulse effect on the text
      anime({
        targets: loadingElement,
        color: ["#000", "#2563eb", "#000"],
        duration: 1000,
        easing: "easeOutQuad",
      });
    } else {
      console.error(`Element with ID "${loadingId}" not found.`);
    }
  }
}

// Comments system functionality
class CommentsSystem {
  constructor() {
    this.visible = 5; // Initial visible count
    this.currentlyVisible = 5; // Track currently visible comments
    this.text_remaining = 0;
    this.comments = [
      {
        order: 1,
        likes: 1,
        avatar: `./assets/images/1.jpg`,
        profile: `#`,
        name: `Elizabeth Amber`,
        text: `I just received my Aldi gift card, and I'm thrilled! Thank you, Shop Smart Program!`,
        image: `./assets/images/test7.jpg`,
        age: `a week ago`,
        createdAt: new Date(2023, 11, 28),
        comments: [],
      },
      {
        order: 2,
        likes: 1,
        avatar: `./assets/images/2.jpg`,
        profile: `#`,
        name: `Linda Bailey`,
        text: `Disappointed that I didn't get it, but happy for those who did. I'll try again next time`,
        image: null,
        age: `a week ago`,
        createdAt: new Date(2023, 11, 27),
        comments: [],
      },
      {
        order: 3,
        likes: 3,
        avatar: `./assets/images/3.jpg`,
        profile: `#`,
        name: `Susan Barbara`,
        text: `It just arrived, already did some shopping. Thanks a ton guys!`,
        image: `./assets/images/test1.jpg`,
        age: `a week ago`,
        createdAt: new Date(2023, 11, 26),
        comments: [
          {
            likes: 16,
            avatar: `./assets/images/brand.jpg`,
            profile: `#`,
            name: `Shop Smart Program`,
            text: `We hope you find everything you need, Barbara! Enjoy!`,
            age: `a week ago`,
            createdAt: new Date(2023, 11, 26, 2, 30),
          },
          {
            likes: 3,
            avatar: `./assets/images/3.jpg`,
            profile: `#`,
            name: `Susan Barbara`,
            text: `I'm sure I will!`,
            age: `a week ago`,
            createdAt: new Date(2023, 11, 26, 4, 15),
          },
        ],
      },
      {
        order: 4,
        likes: 7,
        avatar: `./assets/images/4.jpg`,
        profile: `#`,
        name: `Richard Richards`,
        text: `I think it will be enough for my girlfriend for the whole month's shopping`,
        image: null,
        age: `two weeks ago`,
        createdAt: new Date(2023, 11, 20),
        comments: [],
      },
      {
        order: 5,
        likes: 7,
        avatar: `./assets/images/5.jpg`,
        profile: `#`,
        name: `Laura Hernandez`,
        text: `I didn't spend even half of the amount, but I managed to get a lot. I think they won a customer`,
        image: null,
        age: `two weeks ago`,
        createdAt: new Date(2023, 11, 19),
        comments: [
          {
            likes: 25,
            avatar: `./assets/images/brand.jpg`,
            profile: `#`,
            name: `Shop Smart Program`,
            text: `Enjoy your grocery shopping! We're happy for you!`,
            age: `two weeks ago`,
            createdAt: new Date(2023, 11, 19, 3, 45),
          },
        ],
      },
      {
        order: 6,
        likes: 8,
        avatar: `./assets/images/10.jpg`,
        profile: `#`,
        name: `Paul Harris`,
        text: `No luck for me, but at least I tried`,
        image: null,
        age: `two weeks ago`,
        createdAt: new Date(2023, 11, 18),
        comments: [],
      },
      {
        order: 7,
        likes: 3,
        avatar: `./assets/images/11.jpg`,
        profile: `#`,
        name: `Sarah Trajbar`,
        text: `I had no more space for them in the trunk, so I put them wherever I could. Thanks to the whole Shop Smart Program team:`,
        image: `./assets/images/test2.jpg`,
        age: `two weeks ago`,
        createdAt: new Date(2023, 11, 17),
        comments: [
          {
            likes: 56,
            avatar: `./assets/images/brand.jpg`,
            profile: `#`,
            name: `Shop Smart Program`,
            text: `That's what we like to hear, happy shopping!`,
            age: `two weeks ago`,
            createdAt: new Date(2023, 11, 17, 5, 20),
          },
        ],
      },
      {
        order: 8,
        likes: 12,
        avatar: `./assets/images/12.jpg`,
        profile: `#`,
        name: `Gary Currier`,
        text: `When I get home I will invite my friends to a barbecue`,
        image: `./assets/images/test5.jpg`,
        age: `two weeks ago`,
        createdAt: new Date(2023, 11, 16),
        comments: [],
      },
      {
        order: 9,
        likes: 3,
        avatar: `./assets/images/13.jpg`,
        profile: `#`,
        name: `Eric Feller`,
        text: `What?? I just got accepted. Can't believe it!`,
        image: null,
        age: `two weeks ago`,
        createdAt: new Date(2023, 11, 15),
        comments: [],
      },
      {
        order: 10,
        likes: 1,
        avatar: `./assets/images/14.jpg`,
        profile: `#`,
        name: `Moore Pamela`,
        text: `What a pleasant surprise! It really is a help, food has become very expensive`,
        image: null,
        age: `two weeks ago`,
        createdAt: new Date(2023, 11, 14),
        comments: [],
      },
      {
        order: 11,
        likes: 1,
        avatar: `./assets/images/15.jpg`,
        profile: `#`,
        name: `Ari Marie`,
        text: `I haven't had the car so loaded for a long time. Thank you very much:`,
        image: null,
        age: `two weeks ago`,
        createdAt: new Date(2023, 11, 13),
        comments: [],
      },
      {
        order: 13,
        likes: 6,
        avatar: `./assets/images/20.jpg`,
        profile: `#`,
        name: `Justin Mcmullan`,
        text: `Tonight I will cook. I'm curious what my family will say, it doesn't happen very often. Hope that there will be future editions of this Program, I'll definitely participate`,
        image: `./assets/images/test4.jpg`,
        age: `two weeks ago`,
        createdAt: new Date(2023, 11, 12),
        comments: [],
      },
    ];
  }

  // Initialize and set up comments system
  init() {
    this.setupJQueryExtensions();
    this.renderCommentsToDOM();
    this.setupEventListeners();
  }

  // Get total comment count (including replies)
  getTotalCommentCount() {
    let count = this.comments.length;
    // Add all replies/sub-comments
    for (const comment of this.comments) {
      count += comment.comments.length;
    }
    return count;
  }

  // Set up any jQuery extensions (none needed now as we sort the data directly)
  setupJQueryExtensions() {
    // This method is kept for backward compatibility
  }

  // Generate comment HTML
  renderComments() {
    const obj_comment = `
      <div class="comment sort-coms start-coms" data-order="{{ORDER}}" data-likes="{{LIKES}}" data-created-at="{{CREATED_TIMESTAMP}}">
        <div class="comment-header">
          <div class="comment-user-img">
            <img src="{{AVATAR}}" width="48" height="48" alt="{{USERNAME}}" />
          </div>
          <div class="comment-user-info">
            <div class="comment-user-name">{{USERNAME}}</div>
            <div class="comment-time">{{TIMEAGO}}</div>
          </div>
        </div>
        <div class="comment-text">{{COMMENT_TEXT}} {{COMMENT_IMG}}</div>
        <div class="comment-actions">
          <button class="comment-action like-button" title="Like">
            <i class="material-icons">thumb_up</i>
            <span class="like-count">{{LIKES}}</span>
          </button>
          <button class="comment-action" title="Reply">
            <i class="material-icons">reply</i>
          </button>
        </div>
        {{SUB_COMMENTS}}
      </div>
    `;

    const obj_sub_comment = `
      <div class="comment">
        <div class="comment-header">
          <div class="comment-user-img">
            <img src="{{AVATAR}}" width="48" height="48" alt="{{USERNAME}}" />
          </div>
          <div class="comment-user-info">
            <div class="comment-user-name">{{USERNAME}}</div>
            <div class="comment-time">{{TIMEAGO}}</div>
          </div>
        </div>
        <div class="comment-text">{{COMMENT_TEXT}}</div>
        <div class="comment-actions">
          <button class="comment-action like-button" title="Like">
            <i class="material-icons">thumb_up</i>
            <span class="like-count">{{LIKES}}</span>
          </button>
          <button class="comment-action" title="Reply">
            <i class="material-icons">reply</i>
          </button>
        </div>
      </div>
    `;

    let html = "";

    for (const comment of this.comments) {
      // Ensure createdAt is a valid date
      if (!comment.createdAt) {
        comment.createdAt = new Date(); // Set default to now
      }

      let sub_comments = "";

      for (const scomment of comment.comments) {
        // Ensure sub-comment createdAt is valid
        if (!scomment.createdAt) {
          scomment.createdAt = new Date(); // Set default to now
        }

        sub_comments += obj_sub_comment
          .replace(new RegExp("{{PROFILE_URL}}", "g"), scomment.profile)
          .replace(new RegExp("{{AVATAR}}", "g"), scomment.avatar)
          .replace(new RegExp("{{USERNAME}}", "g"), scomment.name)
          .replace(new RegExp("{{COMMENT_TEXT}}", "g"), scomment.text)
          .replace(new RegExp("{{LIKES}}", "g"), scomment.likes)
          .replace(new RegExp("{{TIMEAGO}}", "g"), scomment.age);
      }

      let img_html = comment.image
        ? `<div class="comment-image"><img class="fb-img" src="${comment.image}" alt="${comment.name}"/></div>`
        : "";

      const timestamp = comment.createdAt.getTime();

      html += obj_comment
        .replace(new RegExp("{{PROFILE_URL}}", "g"), comment.profile)
        .replace(new RegExp("{{AVATAR}}", "g"), comment.avatar)
        .replace(new RegExp("{{USERNAME}}", "g"), comment.name)
        .replace(new RegExp("{{COMMENT_TEXT}}", "g"), comment.text)
        .replace(new RegExp("{{COMMENT_IMG}}", "g"), img_html)
        .replace(new RegExp("{{LIKES}}", "g"), comment.likes)
        .replace(new RegExp("{{ORDER}}", "g"), comment.order)
        .replace(new RegExp("{{CREATED_TIMESTAMP}}", "g"), timestamp)
        .replace(new RegExp("{{TIMEAGO}}", "g"), comment.age)
        .replace(new RegExp("{{SUB_COMMENTS}}", "g"), sub_comments);
    }

    return html;
  }

  // Render comments to DOM
  renderCommentsToDOM() {
    const html_comms = this.renderComments();
    $(".main-comments").html(html_comms);

    setTimeout(() => {
      // Show actual comment count instead of hardcoded 130
      const totalComments = this.getTotalCommentCount();
      $(".sorting-box > p").html(`${totalComments} comments`);
      $(".start-coms").removeClass("start-coms");

      // Show initial comments and set up load more button
      this.setupInitialCommentsView();
    }, 250);
  }

  // Set up initial comments view and load more button
  setupInitialCommentsView() {
    // Hide all main comments initially (using sort-coms class to target only main comments)
    $(".sort-coms").hide();

    // Get main comments only (not sub-comments)
    const mainComments = $(".main-comments > .sort-coms");

    // Show the number of main comments based on tracked visible count
    // If currentlyVisible is higher than total, show all
    const commentsToShow = Math.min(this.currentlyVisible, mainComments.length);
    mainComments.slice(0, commentsToShow).show();

    // Show or hide load more button based on comment count
    const loadMoreBtn = $(".load-more");

    if (mainComments.length <= commentsToShow) {
      // No more comments to load, hide the button
      loadMoreBtn.hide();
    } else {
      // More comments to load, show the button
      loadMoreBtn.show();

      // Update button text to show correct count
      const remainingCount = mainComments.length - commentsToShow;
      loadMoreBtn
        .find("span")
        .text(`Load ${Math.min(5, remainingCount)} more comments`);
    }
  }

  // Set up all event listeners for comments system
  setupEventListeners() {
    const self = this;

    // Comment textarea focus
    $(document).on("click", "textarea", function () {
      $(".add-comment").addClass("active");
    });

    // Checkbox change handling
    $(".comment-button-left [type=checkbox]").on("change", function () {
      if ($(this).is(":checked") && self.text_remaining > 0) {
        $(".comment-button-left p").show();
        $(".comment-button-right button")
          .addClass("disabled")
          .prop("disabled", true);
      } else {
        $(".comment-button-left p").hide();
        $(".comment-button-right button")
          .removeClass("disabled")
          .prop("disabled", false);
      }
    });

    // Sort selection
    $(document).on("change", "#sort-comments", function () {
      const sortType = $(this).val();

      // Sort the comments array directly based on the selected sort type
      if (sortType === "most-liked") {
        self.comments.sort((a, b) => b.likes - a.likes);
      } else if (sortType === "newest") {
        self.comments.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
      } else if (sortType === "oldest") {
        self.comments.sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        );
      } else {
        // Default sort by order
        self.comments.sort((a, b) => a.order - b.order);
      }

      // Reset visible count to show all comments when sorting changes
      self.currentlyVisible = self.visible;

      // Re-render the sorted comments
      const html_comms = self.renderComments();
      $(".main-comments").html(html_comms);

      // Indicate sorting action is happening
      $(".inner-sorting-box > svg").css({ display: "inline-block" });
      setTimeout(function () {
        $(".inner-sorting-box > svg").hide();
      }, 200);

      // Reset comment visibility after sorting
      self.setupInitialCommentsView();
    });

    // Load more comments button
    $(document).on("click", ".load-more", function () {
      // Only look at hidden MAIN comments
      const hiddenComments = $(".main-comments > .sort-coms:hidden");
      const commentsToShow = hiddenComments.slice(0, 5); // Show next 5
      commentsToShow.show();

      // Update the currently visible count
      self.currentlyVisible += commentsToShow.length;

      // Update button state
      if (hiddenComments.length <= 5) {
        $(this)
          .addClass("end-coms")
          .prop("disabled", true)
          .find("span")
          .text("No More Comments");
      } else {
        // Update the count of remaining comments to load
        const remainingCount = hiddenComments.length - 5;
        $(this)
          .find("span")
          .text(`Load ${Math.min(5, remainingCount)} more comments`);
      }
    });

    // Comment textarea keyup handling
    $("textarea").keyup(function () {
      const text_length = $(this).val().length;
      self.text_remaining = 6 - text_length;

      if (text_length <= 0) {
        $(".comment-button-right button")
          .addClass("disabled")
          .prop("disabled", true);
      } else {
        $(".comment-button-right button")
          .removeClass("disabled")
          .prop("disabled", false);
      }

      $(".comment-button-left p").html(
        "Write " + self.text_remaining + " more characters to post to Facebook"
      );

      if ($(".comment-button-left [type=checkbox]").is(":checked")) {
        if (self.text_remaining <= 0) {
          $(".comment-button-left p").hide();
          $(".comment-button-right button")
            .removeClass("disabled")
            .prop("disabled", false);
        } else {
          $(".comment-button-left p").show();
          $(".comment-button-right button")
            .addClass("disabled")
            .prop("disabled", true);
        }
      }
    });

    // Submit comment button
    $(".comment-button-right button").on("click", function () {
      alert("Comments are disabled by the author.");
    });

    // Comment actions
    $(".comment-meta button").on("click", function () {
      alert("Action prohibited. You are not authenticated.");
    });

    // Like and reply buttons
    $(document).on("click", ".comment-action", function () {
      alert("Action prohibited. You are not authenticated.");
    });
  }
}

// Modal-related functionality
class ModalsManager {
  constructor() {
    this.faqTrigger = document.getElementById("faq-trigger");
    this.faqModal = document.getElementById("faqModal");
    this.closeModal = document.getElementById("closeModal");
    this.faqItems = document.querySelectorAll(".faq-item");
  }

  init() {
    if (this.faqTrigger && this.faqModal && this.closeModal) {
      this.setupEventListeners();
      this.setupFaqItemsToggle();
    }
  }

  setupEventListeners() {
    // Open modal when trigger is clicked
    this.faqTrigger.addEventListener("click", () => {
      this.faqModal.classList.add("show");
      document.body.style.overflow = "hidden"; // Prevent scrolling while modal is open
    });

    // Close modal when close button is clicked
    this.closeModal.addEventListener("click", () => {
      this.faqModal.classList.remove("show");
      document.body.style.overflow = ""; // Re-enable scrolling
    });

    // Close modal when clicking outside the modal content
    this.faqModal.addEventListener("click", (event) => {
      if (event.target === this.faqModal) {
        this.faqModal.classList.remove("show");
        document.body.style.overflow = ""; // Re-enable scrolling
      }
    });

    // Close modal with escape key
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.faqModal.classList.contains("show")) {
        this.faqModal.classList.remove("show");
        document.body.style.overflow = ""; // Re-enable scrolling
      }
    });
  }

  setupFaqItemsToggle() {
    const faqQuestions = document.querySelectorAll(".faq-question");

    faqQuestions.forEach((question) => {
      question.addEventListener("click", () => {
        // Toggle active class on question
        question.classList.toggle("active");

        // Toggle visibility of answer
        const answer = question.nextElementSibling;
        if (answer.classList.contains("show")) {
          answer.classList.remove("show");
        } else {
          // Hide all other answers first
          document.querySelectorAll(".faq-answer").forEach((item) => {
            item.classList.remove("show");
          });
          // Show the clicked answer
          answer.classList.add("show");
        }
      });
    });
  }

  toggleFaq(faqNumber) {
    const faqItem = document.getElementById(`faq${faqNumber}`);
    if (faqItem) {
      const faqAnswer = faqItem.querySelector(".faq-answer");
      const faqQuestion = faqItem.querySelector(".faq-question");

      if (faqAnswer && faqQuestion) {
        faqQuestion.classList.toggle("active");
        faqAnswer.classList.toggle("show");
      }
    }
  }
}

// Section management functionality
class SectionManager {
  constructor() {
    this.sections = {
      beforeQuiz: document.getElementById("before-quiz"),
      startQuiz: document.getElementById("start-quiz"),
      unaccepted: document.getElementById("unaccepted"),
      afterQuiz: document.getElementById("after-quiz"),
      finalPage: document.getElementById("final-page"),
    };

    this.currentSection = null;
    this.animationInProgress = false;

    // Validate sections exist
    for (const key in this.sections) {
      if (!this.sections[key]) {
        console.error(`Section "${key}" not found.`);
      }
    }
  }

  // Show a specific section and hide others with smooth animations
  showSection(sectionKey) {
    if (!this.sections[sectionKey]) {
      console.error(`Section "${sectionKey}" not found.`);
      return;
    }

    // If same section or animation in progress, do nothing
    if (this.currentSection === sectionKey || this.animationInProgress) {
      return;
    }

    this.animationInProgress = true;
    const currentSectionElement = this.currentSection
      ? this.sections[this.currentSection]
      : null;
    const targetSection = this.sections[sectionKey];

    // Animation sequence
    const timeline = anime.timeline({
      easing: "easeOutQuad",
      complete: () => {
        this.animationInProgress = false;
      },
    });

    // 1. Fade out current section if any
    if (currentSectionElement) {
      timeline.add({
        targets: currentSectionElement,
        opacity: [1, 0],
        translateY: [0, -20],
        scale: [1, 0.98],
        duration: 300,
        easing: "easeOutQuad",
        complete: () => {
          currentSectionElement.classList.add("d-none");
        },
      });
    }

    // 2. Fade in target section
    timeline.add(
      {
        targets: targetSection,
        opacity: [0, 1],
        translateY: [20, 0],
        scale: [0.98, 1],
        duration: 500,
        easing: "easeOutQuad",
        begin: () => {
          // Prepare target section for animation
          targetSection.classList.remove("d-none");
          targetSection.style.opacity = "0";
          targetSection.style.visibility = "visible";
        },
      },
      currentSectionElement ? "+=50" : 0
    ); // Small delay between transitions if there's a current section

    // Update current section reference
    this.currentSection = sectionKey;

    // Scroll to top of page
    document
      .getElementById("page-content")
      .scrollIntoView({ behavior: "smooth" });

    // Return the timeline for potential chaining
    return timeline;
  }

  // Initialize with default section
  init() {
    // Set initial section
    if (this.sections.beforeQuiz) {
      this.sections.beforeQuiz.classList.remove("d-none");
      this.currentSection = "beforeQuiz";

      // Initial entrance animation for first section
      anime({
        targets: this.sections.beforeQuiz,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        easing: "easeOutQuad",
      });
    }
  }
}

// Main initialization
document.addEventListener("DOMContentLoaded", () => {
  try {
    // Initialize all components
    const timer = new Timer();
    const quiz = new Quiz();
    const loading = new LoadingHandler();
    const comments = new CommentsSystem();
    const modals = new ModalsManager();
    const sectionManager = new SectionManager();

    // Initialize components that need immediate setup
    timer.init();
    sectionManager.init();
    comments.init();
    modals.init();

    // Set up start quiz button
    const startQuizButton = document.getElementById("start-quiz-button");

    if (startQuizButton) {
      startQuizButton.addEventListener("click", () => {
        sectionManager.showSection("startQuiz");
        timer.show();
        timer.start(() => {
          sectionManager.showSection("unaccepted");
        });

        // Handle quiz answers
        quiz.loadQuestion((status, isValid) => {
          if (status === "invalid") {
            timer.stop();
            sectionManager.showSection("unaccepted");
          } else if (status === "completed") {
            // Show loading after quiz completion
            sectionManager.showSection("afterQuiz");
            loading.addCheckMarks(() => {
              sectionManager.showSection("finalPage");
            });
          }
        });
      });
    }

    // Set up try again button
    const startAgainButton = document.getElementById("start-again");

    if (startAgainButton) {
      startAgainButton.addEventListener("click", () => {
        sectionManager.showSection("beforeQuiz");
        quiz.reset();
        timer.reset();
      });
    }
  } catch (error) {
    // Handle any errors during initialization
  }
});
