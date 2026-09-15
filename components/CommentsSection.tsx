"use client";

import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { supabase } from "@/utils/supabase";
import {
  FaUserCircle,
  FaSpinner,
  FaCheck,
  FaArrowRight,
  FaTimes,
} from "react-icons/fa";

interface Comment {
  id: string;
  user_name: string;
  content: string;
  created_at: string;
}

interface SwipeToPostButtonProps {
  onConfirm: () => Promise<boolean>;
  isSubmitting: boolean;
  disabled: boolean;
}

const SwipeToPostButton = ({
  onConfirm,
  isSubmitting,
  disabled,
}: SwipeToPostButtonProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  // Tracks the moment the swipe/keyboard commit is confirmed, ahead of the
  // parent's isSubmitting prop. Without this the idle "Swipe to Post" label
  // can flash back on for a frame between the thumb landing and isSubmitting
  // turning true.
  const [isConfirming, setIsConfirming] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  // Gesture state kept in refs so pointer movement does not trigger
  // React re-renders on every pointer event.
  const positionRef = useRef(0);
  const isDraggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const pointerOffsetRef = useRef(0);

  // Velocity tracking for intentional swipe detection.
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);

  // Animation frame management.
  const animationFrameRef = useRef<number | null>(null);
  const animationTokenRef = useRef(0);

  // Prevent stale submission callbacks.
  const confirmedRef = useRef(false);

  // Success/error timers.
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const THUMB_SIZE = 48;
  const TRACK_PADDING = 4;

  const getMaxDrag = useCallback(() => {
    if (!containerRef.current) {
      return 0;
    }

    return Math.max(
      0,
      containerRef.current.getBoundingClientRect().width -
        THUMB_SIZE -
        TRACK_PADDING * 2
    );
  }, []);

  const reducedMotion = useCallback(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  /*
   * Apply the position directly to the DOM.
   *
   * transform is used instead of left/width so the drag remains
   * compositor-friendly. The fill track is sized in pixels (thumb width +
   * distance travelled) rather than a scaleX percentage, so it always
   * matches the thumb exactly - including at rest, with no hardcoded
   * starting fraction to keep in sync.
   */
  const applyPosition = useCallback(
    (value: number) => {
      const thumb = thumbRef.current;
      const fill = fillRef.current;

      if (!thumb || !fill) {
        return;
      }

      const maxDrag = getMaxDrag();

      const x = Math.max(0, Math.min(value, maxDrag));

      positionRef.current = x;

      thumb.style.transform = `translate3d(${x}px, 0, 0)`;
      fill.style.width = `${THUMB_SIZE + x}px`;

      const progress = maxDrag > 0 ? x / maxDrag : 0;

      /*
       * Very subtle text fade during the drag.
       * This is done directly on the CSS variable so React doesn't
       * need to re-render for every pointer movement.
       */
      containerRef.current?.style.setProperty(
        "--swipe-progress",
        progress.toString()
      );
    },
    [getMaxDrag]
  );

  const cancelAnimation = useCallback(() => {
    animationTokenRef.current += 1;

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  /*
   * Smoothly animate the thumb to a destination.
   *
   * This uses a damped ease rather than a CSS transition so that the
   * animation remains fully under our control.
   */
  const animateTo = useCallback(
    (
      target: number,
      duration = 300,
      onComplete?: () => void
    ) => {
      cancelAnimation();

      const token = animationTokenRef.current;
      const start = positionRef.current;

      if (Math.abs(target - start) < 0.5) {
        applyPosition(target);
        onComplete?.();
        return;
      }

      if (reducedMotion()) {
        applyPosition(target);
        onComplete?.();
        return;
      }

      const startTime = performance.now();

      const tick = (now: number) => {
        if (token !== animationTokenRef.current) {
          return;
        }

        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);

        // Smooth ease-out with a natural deceleration.
        const eased =
          1 - Math.pow(1 - progress, 4);

        const current =
          start + (target - start) * eased;

        applyPosition(current);

        if (progress < 1) {
          animationFrameRef.current =
            requestAnimationFrame(tick);
        } else {
          animationFrameRef.current = null;
          applyPosition(target);
          onComplete?.();
        }
      };

      animationFrameRef.current =
        requestAnimationFrame(tick);
    },
    [
      applyPosition,
      cancelAnimation,
      reducedMotion,
    ]
  );

  const clearStatusTimer = useCallback(() => {
    if (statusTimerRef.current !== null) {
      clearTimeout(statusTimerRef.current);
      statusTimerRef.current = null;
    }
  }, []);

  const resetButton = useCallback(() => {
    clearStatusTimer();

    confirmedRef.current = false;
    isDraggingRef.current = false;
    pointerIdRef.current = null;

    setIsDragging(false);
    setIsConfirming(false);
    setStatus("idle");

    animateTo(0, 300);
  }, [animateTo, clearStatusTimer]);

  // Keep the thumb and fill pixel-accurate on mount and whenever the track
  // is resized (e.g. orientation change), as long as nothing is mid-gesture.
  useLayoutEffect(() => {
    applyPosition(0);

    const handleResize = () => {
      if (!isDraggingRef.current && status === "idle" && !isConfirming) {
        applyPosition(0);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Pointer Down                                                            */
  /* ---------------------------------------------------------------------- */

  const handlePointerDown = (
    e: ReactPointerEvent<HTMLDivElement>
  ) => {
    if (
      disabled ||
      isSubmitting ||
      status !== "idle"
    ) {
      return;
    }

    const thumb = thumbRef.current;

    if (!thumb) {
      return;
    }

    e.preventDefault();

    cancelAnimation();

    const rect = thumb.getBoundingClientRect();

    /*
     * Preserve the exact point inside the thumb where the user touched.
     * This prevents the thumb from jumping when grabbed.
     */
    pointerOffsetRef.current =
      e.clientX - rect.left;

    pointerIdRef.current = e.pointerId;
    isDraggingRef.current = true;

    setIsDragging(true);

    lastXRef.current = positionRef.current;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;

    try {
      thumb.setPointerCapture(e.pointerId);
    } catch {
      // Ignore unsupported pointer-capture behavior.
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Pointer Move                                                            */
  /* ---------------------------------------------------------------------- */

  const handlePointerMove = (
    e: ReactPointerEvent<HTMLDivElement>
  ) => {
    if (
      !isDraggingRef.current ||
      pointerIdRef.current !== e.pointerId ||
      !containerRef.current
    ) {
      return;
    }

    e.preventDefault();

    const containerRect =
      containerRef.current.getBoundingClientRect();

    const maxDrag = getMaxDrag();

    let nextX =
      e.clientX -
      containerRect.left -
      pointerOffsetRef.current -
      TRACK_PADDING;

    /*
     * Small resistance at both ends gives the thumb a more physical feel.
     */
    if (nextX > maxDrag) {
      const excess = nextX - maxDrag;
      nextX =
        maxDrag +
        Math.min(excess * 0.18, 8);
    }

    if (nextX < 0) {
      nextX = Math.max(nextX * 0.18, -6);
    }

    const now = performance.now();
    const dt = Math.max(
      1,
      now - lastTimeRef.current
    );

    const dx =
      nextX - lastXRef.current;

    const instantaneousVelocity =
      dx / dt;

    /*
     * Smooth velocity to avoid noisy pointer data.
     */
    velocityRef.current =
      velocityRef.current * 0.75 +
      instantaneousVelocity * 0.25;

    lastXRef.current = nextX;
    lastTimeRef.current = now;

    /*
     * One DOM update per animation frame.
     */
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(
        animationFrameRef.current
      );
    }

    animationFrameRef.current =
      requestAnimationFrame(() => {
        applyPosition(nextX);
        animationFrameRef.current = null;
      });
  };

  /* ---------------------------------------------------------------------- */
  /* Pointer End                                                             */
  /* ---------------------------------------------------------------------- */

  const finishPointer = async (
    e: ReactPointerEvent<HTMLDivElement>,
    cancelled: boolean
  ) => {
    if (
      !isDraggingRef.current ||
      pointerIdRef.current !== e.pointerId
    ) {
      return;
    }

    e.preventDefault();

    isDraggingRef.current = false;
    pointerIdRef.current = null;

    setIsDragging(false);

    const thumb = thumbRef.current;

    if (
      thumb &&
      thumb.hasPointerCapture(e.pointerId)
    ) {
      try {
        thumb.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore browser-specific pointer-capture errors.
      }
    }

    const maxDrag = getMaxDrag();

    if (cancelled || maxDrag <= 0) {
      animateTo(0, 260);
      return;
    }

    const currentX = Math.min(
      positionRef.current,
      maxDrag
    );

    const progress =
      currentX / maxDrag;

    const velocity = Math.abs(
      velocityRef.current
    );

    /*
     * Intentional swipe detection:
     *
     * Normal deliberate swipe:
     *   >= 76% distance
     *
     * Fast deliberate swipe:
     *   >= 58% distance + sufficient velocity
     */
    const distanceConfirmed =
      progress >= 0.76;

    const velocityConfirmed =
      progress >= 0.58 &&
      velocity >= 0.45;

    const shouldSubmit =
      distanceConfirmed ||
      velocityConfirmed;

    if (
      !shouldSubmit ||
      disabled ||
      isSubmitting
    ) {
      animateTo(0, 300);
      return;
    }

    confirmedRef.current = true;
    setIsConfirming(true);

    /*
     * Complete the swipe visually before submitting.
     */
    animateTo(
      maxDrag,
      180,
      async () => {
        if (!confirmedRef.current) {
          return;
        }

        const success =
          await onConfirm();

        if (!confirmedRef.current) {
          return;
        }

        setIsConfirming(false);

        if (success) {
          setStatus("success");

          clearStatusTimer();

          statusTimerRef.current =
            setTimeout(() => {
              resetButton();
            }, 1500);
        } else {
          confirmedRef.current = false;

          setStatus("error");

          clearStatusTimer();

          statusTimerRef.current =
            setTimeout(() => {
              setStatus("idle");

              animateTo(0, 320);
            }, 1100);
        }
      }
    );
  };

  const handlePointerUp = (
    e: ReactPointerEvent<HTMLDivElement>
  ) => {
    void finishPointer(e, false);
  };

  const handlePointerCancel = (
    e: ReactPointerEvent<HTMLDivElement>
  ) => {
    /*
     * A cancelled gesture can NEVER submit.
     */
    void finishPointer(e, true);
  };

  /* ---------------------------------------------------------------------- */
  /* Keyboard Accessibility                                                  */
  /* ---------------------------------------------------------------------- */

  const handleKeyDown = (
    e: ReactKeyboardEvent<HTMLDivElement>
  ) => {
    if (
      disabled ||
      isSubmitting ||
      status !== "idle"
    ) {
      return;
    }

    if (
      e.key !== "Enter" &&
      e.key !== " "
    ) {
      return;
    }

    e.preventDefault();

    const maxDrag = getMaxDrag();

    if (maxDrag <= 0) {
      return;
    }

    confirmedRef.current = true;
    setIsConfirming(true);

    animateTo(
      maxDrag,
      180,
      async () => {
        const success =
          await onConfirm();

        if (!confirmedRef.current) {
          return;
        }

        setIsConfirming(false);

        if (success) {
          setStatus("success");

          clearStatusTimer();

          statusTimerRef.current =
            setTimeout(() => {
              resetButton();
            }, 1500);
        } else {
          confirmedRef.current = false;

          setStatus("error");

          clearStatusTimer();

          statusTimerRef.current =
            setTimeout(() => {
              setStatus("idle");
              animateTo(0, 320);
            }, 1100);
        }
      }
    );
  };

  /* ---------------------------------------------------------------------- */
  /* Cleanup                                                                 */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    return () => {
      cancelAnimation();
      clearStatusTimer();
    };
  }, [cancelAnimation, clearStatusTimer]);

  const showPosting = isSubmitting || isConfirming;
  const showSuccess = status === "success";
  const showError = status === "error";
  const hideIdleLabel =
    isDragging || showPosting || showSuccess || showError;

  return (
    <div
      ref={containerRef}
      className={`relative h-14 w-full max-w-[272px] rounded-full flex items-center p-1 overflow-hidden border transition-colors duration-300 ${
        disabled
          ? "bg-gray-100 border-gray-200"
          : showSuccess
            ? "bg-green-500 border-green-600"
            : showError
              ? "bg-red-50 border-red-200"
              : "bg-orange-100 border-orange-200"
      }`}
    >
      {/* ---------------------------------------------------------------- */}
      {/* Track Fill                                                        */}
      {/* ---------------------------------------------------------------- */}

      <div
        ref={fillRef}
        aria-hidden="true"
        className={`absolute left-1 top-1 bottom-1 rounded-full pointer-events-none ${
          disabled
            ? "bg-gray-200"
            : showSuccess
              ? "bg-green-500"
              : showError
                ? "bg-red-200"
                : "bg-orange-200/60"
        }`}
        style={{
          width: THUMB_SIZE,
          willChange: isDragging
            ? "width"
            : "auto",
        }}
      />

      {/* ---------------------------------------------------------------- */}
      {/* Background Text                                                   */}
      {/* ---------------------------------------------------------------- */}

      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <span
          className={`font-bold text-sm select-none transition-opacity duration-200 ${
            hideIdleLabel
              ? "opacity-0"
              : "opacity-100"
          } ${
            disabled
              ? "text-gray-400"
              : "text-orange-600"
          }`}
        >
          {disabled
            ? "Write a comment"
            : "Swipe to Post"}
        </span>

        <span
          className={`absolute font-bold text-sm text-white select-none transition-opacity duration-200 ${
            showPosting
              ? "opacity-100"
              : "opacity-0"
          }`}
        >
          Posting...
        </span>

        <span
          className={`absolute font-bold text-sm text-white select-none transition-opacity duration-200 ${
            showSuccess
              ? "opacity-100"
              : "opacity-0"
          }`}
        >
          Posted!
        </span>

        <span
          className={`absolute font-bold text-sm text-red-600 select-none transition-opacity duration-200 ${
            showError
              ? "opacity-100"
              : "opacity-0"
          }`}
        >
          Couldn't post
        </span>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Draggable Thumb                                                    */}
      {/* ---------------------------------------------------------------- */}

      <div
        ref={thumbRef}
        role="button"
        aria-label={
          disabled
            ? "Fill in your name and message to enable posting"
            : showPosting
              ? "Posting comment"
              : showSuccess
                ? "Comment posted successfully"
                : showError
                  ? "Comment could not be posted"
                  : "Swipe right to post your comment"
        }
        aria-disabled={
          disabled ||
          isSubmitting ||
          showSuccess
        }
        tabIndex={
          disabled ||
          isSubmitting ||
          showSuccess
            ? -1
            : 0
        }
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
        className={`absolute left-1 top-1 h-12 w-12 rounded-full flex items-center justify-center shadow-md z-10 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500 ${
          disabled
            ? "bg-gray-300 cursor-not-allowed"
            : showSuccess
              ? "bg-white"
              : showError
                ? "bg-red-500"
                : "bg-orange-600 cursor-grab active:cursor-grabbing hover:bg-orange-700"
        } ${
          isDragging
            ? "transition-none"
            : "transition-[background-color,box-shadow] duration-200 ease-out"
        }`}
        style={{
          transform:
            "translate3d(0, 0, 0)",
          touchAction: "none",
          willChange: isDragging
            ? "transform"
            : "auto",
        }}
      >
        {showPosting ? (
          <FaSpinner
            className="text-white animate-spin"
            size={16}
            aria-hidden="true"
          />
        ) : showSuccess ? (
          <FaCheck
            className="text-green-500"
            size={18}
            aria-hidden="true"
          />
        ) : showError ? (
          <FaTimes
            className="text-white"
            size={17}
            aria-hidden="true"
          />
        ) : (
          <FaArrowRight
            className={
              disabled
                ? "text-gray-400"
                : "text-white"
            }
            size={16}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              Comments Section                              */
/* -------------------------------------------------------------------------- */

export default function CommentsSection({
  bhajanSlug,
}: {
  bhajanSlug: string;
}) {
  const [comments, setComments] =
    useState<Comment[]>([]);

  const [newName, setNewName] =
    useState("");

  const [newComment, setNewComment] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /* ---------------------------------------------------------------------- */
  /* Fetch Comments                                                          */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    let mounted = true;

    const fetchComments = async () => {
      const { data } = await supabase
        .from("comments")
        .select(
          "id, user_name, content, created_at"
        )
        .eq("bhajan_slug", bhajanSlug)
        .order("created_at", {
          ascending: false,
        });

      if (mounted && data) {
        setComments(data);
      }
    };

    void fetchComments();

    return () => {
      mounted = false;
    };
  }, [bhajanSlug]);

  /* ---------------------------------------------------------------------- */
  /* Submit Comment                                                          */
  /* ---------------------------------------------------------------------- */

  const handleSwipeConfirm =
    async (): Promise<boolean> => {
      if (
        !newName.trim() ||
        !newComment.trim() ||
        isSubmitting
      ) {
        return false;
      }

      setIsSubmitting(true);

      try {
        const {
          data,
          error,
        } = await supabase
          .from("comments")
          .insert([
            {
              bhajan_slug: bhajanSlug,
              user_name: newName.trim(),
              content: newComment.trim(),
            },
          ])
          .select(
            "id, user_name, content, created_at"
          )
          .single();

        if (error || !data) {
          return false;
        }

        setComments((previous) => [
          data,
          ...previous,
        ]);

        setNewName("");
        setNewComment("");

        return true;
      } catch {
        return false;
      } finally {
        setIsSubmitting(false);
      }
    };

  /* ---------------------------------------------------------------------- */
  /* Date Formatting                                                         */
  /* ---------------------------------------------------------------------- */

  const formatDate = (
    dateString: string
  ) => {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    ).format(new Date(dateString));
  };

  /* ---------------------------------------------------------------------- */
  /* Form Validation                                                         */
  /* ---------------------------------------------------------------------- */

  const isFormValid =
    newName.trim().length > 0 &&
    newComment.trim().length > 0;

  /* ---------------------------------------------------------------------- */
  /* UI                                                                      */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="mt-12 pt-8 border-t border-orange-100">
      <h3 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
        Community Comments ({comments.length})
      </h3>

      <div className="bg-orange-50/50 p-5 md:p-6 rounded-2xl border border-orange-100 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-start">
          <div className="md:col-span-1">
            <label
              htmlFor="comment-name"
              className="block text-sm font-bold text-gray-700 mb-1"
            >
              Your Name
            </label>

            <input
              id="comment-name"
              type="text"
              value={newName}
              onChange={(e) =>
                setNewName(e.target.value)
              }
              placeholder="e.g. Priya Sharma"
              maxLength={80}
              autoComplete="name"
              className="w-full px-4 py-2.5 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 bg-white transition-shadow"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="comment-message"
              className="block text-sm font-bold text-gray-700 mb-1"
            >
              Your Message
            </label>

            <textarea
              id="comment-message"
              value={newComment}
              onChange={(e) =>
                setNewComment(e.target.value)
              }
              placeholder="Share your thoughts or feelings..."
              maxLength={1000}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 bg-white transition-shadow resize-none leading-relaxed"
              style={{ minHeight: "44px" }}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <SwipeToPostButton
            onConfirm={handleSwipeConfirm}
            isSubmitting={isSubmitting}
            disabled={!isFormValid}
          />
        </div>
      </div>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 italic text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
            Be the first to share your devotion here.
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-4 p-4 md:p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className="shrink-0 text-orange-200 mt-1"
                aria-hidden="true"
              >
                <FaUserCircle size={36} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1 gap-3">
                  <h4 className="font-bold text-gray-900 truncate">
                    {comment.user_name}
                  </h4>

                  <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                    {formatDate(
                      comment.created_at
                    )}
                  </span>
                </div>

                <p className="text-gray-700 leading-relaxed text-sm md:text-base break-words whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}