'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { createAuction, CreateAuctionPayload } from "../../lib/api";
import { AuctionCategory } from "../../lib/types";
import { addHours, formatISO } from "date-fns";
import { ImageUploader } from "./ImageUploader";

const categories: AuctionCategory[] = [
  "Art",
  "Collectibles",
  "Electronics",
  "Vehicles",
  "Jewelry",
  "Antiques",
  "Sports",
  "Books",
  "Home & Garden",
  "Fashion",
  "Toys & Games",
];
const DURATION_PRESETS = [1, 2, 4, 8, 12, 24, 48];

const toLocalInputValue = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const parseLocalInput = (value: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const CreateAuctionForm = () => {
  const router = useRouter();
  const { token, user } = useAuth();
  const now = useMemo(() => new Date(), []);
  const defaultStart = toLocalInputValue(addHours(now, 1));
  const defaultEnd = toLocalInputValue(addHours(now, 3));

  const [startImmediately, setStartImmediately] = useState(false);
  const [durationHours, setDurationHours] = useState<number>(2);
  const [scheduledStartDraft, setScheduledStartDraft] =
    useState<string>(defaultStart);
  const [formState, setFormState] = useState({
    title: "",
    description: "",
    category: categories[0],
    startingPrice: "",
    minimumIncrement: "",
    startTime: defaultStart,
    endTime: defaultEnd,
    imageUrls: "",
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<
      Record<
        | "title"
        | "description"
        | "startingPrice"
        | "minimumIncrement"
        | "startTime"
        | "endTime"
        | "imageUrls",
        string
      >
    >
  >({});

  const imageList = useMemo(() => {
    const urlImages = formState.imageUrls
      .split(/[\n,]+/)
      .map((url) => url.trim())
      .filter(Boolean);
    // Combine uploaded images and URL images, uploaded images first
    return [...uploadedImages, ...urlImages];
  }, [formState.imageUrls, uploadedImages]);

  const clearFieldError = (field: keyof typeof fieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const handleChange = (
    field:
      | "title"
      | "description"
      | "category"
      | "startingPrice"
      | "minimumIncrement"
      | "startTime"
      | "endTime"
      | "imageUrls",
    value: string
  ) => {
    clearFieldError(field);
    setFormState((prev) => ({
      ...prev,
      [field]:
        value,
    }));
    if (field === "startTime" && !startImmediately) {
      setScheduledStartDraft(value);
    }
  };

  const handleStartImmediatelyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setStartImmediately(checked);
    if (checked) {
      setScheduledStartDraft(formState.startTime);
      const current = new Date();
      setFormState((prev) => ({
        ...prev,
        startTime: toLocalInputValue(current),
        endTime: toLocalInputValue(addHours(current, Math.max(durationHours, 1))),
      }));
      clearFieldError("startTime");
      clearFieldError("endTime");
    } else {
      setFormState((prev) => {
        const startDate =
          parseLocalInput(scheduledStartDraft) ?? addHours(new Date(), 1);
        const startValue = toLocalInputValue(startDate);
        const endDate = parseLocalInput(prev.endTime);
        const adjustedEnd =
          !endDate || endDate <= startDate
            ? toLocalInputValue(addHours(startDate, Math.max(durationHours, 1)))
            : prev.endTime;
        return {
          ...prev,
          startTime: startValue,
          endTime: adjustedEnd,
        };
      });
      clearFieldError("startTime");
      clearFieldError("endTime");
    }
  };

  const handleDurationChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const hours = Number(event.target.value);
    setDurationHours(hours);
    const baseStart = startImmediately
      ? new Date()
      : parseLocalInput(formState.startTime);
    if (baseStart && !Number.isNaN(baseStart.getTime())) {
      setFormState((prev) => ({
        ...prev,
        endTime: toLocalInputValue(addHours(baseStart, Math.max(hours, 1))),
      }));
      clearFieldError("endTime");
    }
  };

  const computeValidationErrors = () => {
    const errors: typeof fieldErrors = {};
    const trimmedTitle = formState.title.trim();
    const trimmedDescription = formState.description.trim();
    if (!trimmedTitle) {
      errors.title = "Title is required.";
    }
    if (!trimmedDescription) {
      errors.description = "Description is required.";
    }

    const startingPriceNum = parseFloat(formState.startingPrice);
    if (!formState.startingPrice || isNaN(startingPriceNum) || startingPriceNum <= 0) {
      errors.startingPrice = "Starting price must be greater than zero.";
    }
    const minimumIncrementNum = parseFloat(formState.minimumIncrement);
    if (formState.minimumIncrement && (isNaN(minimumIncrementNum) || minimumIncrementNum < 0)) {
      errors.minimumIncrement = "Minimum increment cannot be negative.";
    }

    const start = startImmediately ? new Date() : parseLocalInput(formState.startTime);
    const end = parseLocalInput(formState.endTime);
    if (!start) {
      errors.startTime = "Provide a valid start time.";
    }
    if (!end) {
      errors.endTime = "Provide a valid end time.";
    }
    const nowDate = new Date();
    if (start && !startImmediately && start < nowDate) {
      errors.startTime = "Start time cannot be earlier than the current time.";
    }
    if (start && end && end <= start) {
      errors.endTime = "End time must be after the start time.";
    }

    if (
      imageList.length > 0 &&
      imageList.some((url) => !/^https?:\/\//i.test(url))
    ) {
      errors.imageUrls = "Image URLs must start with http:// or https://";
    }
    return errors;
  };

  const canSubmit = useMemo(() => {
    const errors = computeValidationErrors();
    return Object.keys(errors).length === 0;
  }, [
    formState.title,
    formState.description,
    formState.startingPrice,
    formState.minimumIncrement,
    formState.startTime,
    formState.endTime,
    imageList,
    startImmediately,
  ]);

  useEffect(() => {
    if (!startImmediately) return;
    const current = new Date();
    setFormState((prev) => {
      const nextStart = toLocalInputValue(current);
      const nextEnd = toLocalInputValue(
        addHours(current, Math.max(durationHours, 1))
      );
      if (prev.startTime === nextStart && prev.endTime === nextEnd) {
        return prev;
      }
      return {
        ...prev,
        startTime: nextStart,
        endTime: nextEnd,
      };
    });
  }, [startImmediately, durationHours]);

  useEffect(() => {
    const start = parseLocalInput(formState.startTime);
    const end = parseLocalInput(formState.endTime);
    if (!start || !end) {
      return;
    }
    if (end <= start) {
      setFormState((prev) => {
        const adjusted = toLocalInputValue(
          addHours(start, Math.max(durationHours, 1))
        );
        if (prev.endTime === adjusted) {
          return prev;
        }
        return { ...prev, endTime: adjusted };
      });
      clearFieldError("endTime");
    }
  }, [formState.startTime, formState.endTime, durationHours]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !user) {
      setError("You must be signed in to create auctions.");
      return;
    }

    const validationErrors = computeValidationErrors();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError("Please fix the highlighted fields before submitting.");
      return;
    }

    const start = startImmediately
      ? new Date()
      : parseLocalInput(formState.startTime) ?? new Date();
    const end =
      parseLocalInput(formState.endTime) ??
      addHours(start, Math.max(durationHours, 1));

    const startingPriceNum = parseFloat(formState.startingPrice);
    const minimumIncrementNum = parseFloat(formState.minimumIncrement);
    
    const payload: CreateAuctionPayload = {
      title: formState.title.trim(),
      description: formState.description.trim(),
      category: formState.category,
      startingPrice: startingPriceNum,
      minimumIncrement:
        minimumIncrementNum > 0 ? minimumIncrementNum : undefined,
      startTime: formatISO(start),
      endTime: formatISO(end),
      imageUrls: imageList,
    };

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const auction = await createAuction(payload, token);
      setSuccessMessage("Auction created successfully! Redirecting…");
      setTimeout(() => {
        const auctionUrl = auction.slug ? `/auctions/${auction.slug}-${auction._id}` : `/auctions/${auction._id}`;
        router.push(auctionUrl);
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create auction");
    } finally {
      setSubmitting(false);
    }
  };

  const nowInputValue = toLocalInputValue(new Date());

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-4xl flex-col gap-8 rounded-2xl border p-8 backdrop-blur-sm"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--surface)',
        boxShadow: 'var(--shadow-soft)'
      }}
      noValidate
    >
      <div className="space-y-3">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Create Auction</h1>
          <p className="mt-2 text-base" style={{ color: 'var(--muted-foreground)' }}>
            Provide details for your auction item. It will go live immediately if
            the start time is in the past.
          </p>
        </div>
        <div className="rounded-xl border px-4 py-3" style={{ borderColor: 'var(--primary)', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--primary)' }}>
            ⓘ Times are stored in UTC but shown in your local timezone. Double-check
            the schedule before publishing so bidders have enough time to engage.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-2">
          <label className="block text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            Title <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <input
            required
            autoFocus
            value={formState.title}
            onChange={(event) => handleChange("title", event.target.value)}
            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 ${
              fieldErrors.title
                ? ""
                : ""
            }`}
            style={{
              borderColor: fieldErrors.title ? 'var(--error-border)' : 'var(--border)',
              backgroundColor: fieldErrors.title ? 'var(--error-bg)' : 'var(--background)',
              color: 'var(--foreground)'
            }}
            placeholder="Vintage camera collection"
            aria-invalid={Boolean(fieldErrors.title)}
          />
          {fieldErrors.title && (
            <p className="text-xs font-medium" style={{ color: 'var(--error)' }}>{fieldErrors.title}</p>
          )}
        </div>

        <div className="sm:col-span-2 space-y-2">
          <label className="block text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            Description <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <textarea
            required
            value={formState.description}
            onChange={(event) => handleChange("description", event.target.value)}
            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 resize-none ${
              fieldErrors.description
                ? ""
                : ""
            }`}
            style={{
              borderColor: fieldErrors.description ? 'var(--error-border)' : 'var(--border)',
              backgroundColor: fieldErrors.description ? 'var(--error-bg)' : 'var(--background)',
              color: 'var(--foreground)'
            }}
            rows={4}
            placeholder="Describe the item, its condition, provenance, and any other details buyers should know."
            aria-invalid={Boolean(fieldErrors.description)}
          />
          {fieldErrors.description && (
            <p className="text-xs font-medium" style={{ color: 'var(--error)' }}>
              {fieldErrors.description}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            Category
          </label>
          <select
            value={formState.category}
            onChange={(event) => handleChange("category", event.target.value)}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)'
            }}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            Starting Price (USD) <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <input
            required
            type="text"
            inputMode="decimal"
            value={formState.startingPrice}
            onChange={(event) => {
              const value = event.target.value;
              if (value === "" || /^\d*\.?\d*$/.test(value)) {
                handleChange("startingPrice", value);
              }
            }}
            placeholder="0.00"
            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 ${
              fieldErrors.startingPrice
                ? ""
                : ""
            }`}
            style={{
              borderColor: fieldErrors.startingPrice ? 'var(--error-border)' : 'var(--border)',
              backgroundColor: fieldErrors.startingPrice ? 'var(--error-bg)' : 'var(--background)',
              color: 'var(--foreground)'
            }}
            aria-invalid={Boolean(fieldErrors.startingPrice)}
          />
          {fieldErrors.startingPrice && (
            <p className="text-xs font-medium" style={{ color: 'var(--error)' }}>
              {fieldErrors.startingPrice}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            Minimum Increment (USD)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={formState.minimumIncrement}
            onChange={(event) => {
              const value = event.target.value;
              if (value === "" || /^\d*\.?\d*$/.test(value)) {
                handleChange("minimumIncrement", value);
              }
            }}
            placeholder="1.00"
            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 ${
              fieldErrors.minimumIncrement
                ? ""
                : ""
            }`}
            style={{
              borderColor: fieldErrors.minimumIncrement ? 'var(--error-border)' : 'var(--border)',
              backgroundColor: fieldErrors.minimumIncrement ? 'var(--error-bg)' : 'var(--background)',
              color: 'var(--foreground)'
            }}
            aria-invalid={Boolean(fieldErrors.minimumIncrement)}
          />
          {fieldErrors.minimumIncrement && (
            <p className="text-xs font-medium" style={{ color: 'var(--error)' }}>
              {fieldErrors.minimumIncrement}
            </p>
          )}
        </div>

        <div className="sm:col-span-2 rounded-xl border p-5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium transition-colors hover:opacity-80" style={{ color: 'var(--foreground)' }}>
              <input
                type="checkbox"
                checked={startImmediately}
                onChange={handleStartImmediatelyChange}
                className="h-5 w-5 rounded text-primary focus:ring-2 focus:ring-primary/20"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--background)'
                }}
              />
              <span>Start immediately</span>
            </label>
            <label className="flex items-center gap-3 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              <span style={{ color: 'var(--muted-foreground)' }}>Duration:</span>
              <select
                value={durationHours}
                onChange={handleDurationChange}
                className="rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)'
                }}
              >
                {DURATION_PRESETS.map((hours) => (
                  <option key={hours} value={hours}>
                    {hours}h
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            Use "Start immediately" to launch the auction right away. Otherwise,
            pick a future start time and duration so bidders can prepare.
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            Start Time <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <input
            required
            type="datetime-local"
            min={nowInputValue}
            value={formState.startTime}
            onChange={(event) => handleChange("startTime", event.target.value)}
            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 ${
              fieldErrors.startTime
                ? ""
                : ""
            } ${startImmediately ? "opacity-50 cursor-not-allowed" : ""}`}
            style={{
              borderColor: fieldErrors.startTime ? 'var(--error-border)' : 'var(--border)',
              backgroundColor: fieldErrors.startTime ? 'var(--error-bg)' : 'var(--background)',
              color: 'var(--foreground)'
            }}
            disabled={startImmediately}
            aria-invalid={Boolean(fieldErrors.startTime)}
          />
          {fieldErrors.startTime && (
            <p className="text-xs font-medium" style={{ color: 'var(--error)' }}>
              {fieldErrors.startTime}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            End Time <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <input
            required
            type="datetime-local"
            min={formState.startTime}
            value={formState.endTime}
            onChange={(event) => handleChange("endTime", event.target.value)}
            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 ${
              fieldErrors.endTime
                ? ""
                : ""
            }`}
            style={{
              borderColor: fieldErrors.endTime ? 'var(--error-border)' : 'var(--border)',
              backgroundColor: fieldErrors.endTime ? 'var(--error-bg)' : 'var(--background)',
              color: 'var(--foreground)'
            }}
            aria-invalid={Boolean(fieldErrors.endTime)}
          />
          {fieldErrors.endTime && (
            <p className="text-xs font-medium" style={{ color: 'var(--error)' }}>{fieldErrors.endTime}</p>
          )}
        </div>

        <div className="sm:col-span-2 space-y-4">
          <label className="block text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            Images
          </label>
          
          {/* Image Uploader */}
          <ImageUploader
            images={uploadedImages}
            onImagesChange={setUploadedImages}
            onError={(error) => {
              setFieldErrors((prev) => ({ ...prev, imageUrls: error }));
            }}
          />

          {/* URL Input (Alternative) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
              Or add image URLs
            </label>
            <textarea
              value={formState.imageUrls}
              onChange={(event) => handleChange("imageUrls", event.target.value)}
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 resize-none ${
                ""
              }`}
              style={{
                borderColor: fieldErrors.imageUrls ? 'var(--error-border)' : 'var(--border)',
                backgroundColor: fieldErrors.imageUrls ? 'var(--error-bg)' : 'var(--background)',
                color: 'var(--foreground)'
              }}
              rows={3}
              placeholder="https://example.com/image-1.jpg&#10;https://example.com/image-2.jpg"
              aria-invalid={Boolean(fieldErrors.imageUrls)}
            />
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Optional. Provide one absolute URL per line or separate them with commas.
            </p>
            {fieldErrors.imageUrls && (
              <p className="text-xs font-medium" style={{ color: 'var(--error)' }}>
                {fieldErrors.imageUrls}
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border px-4 py-3" style={{ borderColor: 'var(--error-border)', backgroundColor: 'var(--error-bg)' }}>
          <p className="text-sm font-medium" role="alert" style={{ color: 'var(--error)' }}>
            {error}
          </p>
        </div>
      )}
      {successMessage && (
        <div className="rounded-xl border px-4 py-3" style={{ borderColor: 'var(--success-border)', backgroundColor: 'var(--success-bg)' }}>
          <p className="text-sm font-medium" role="status" style={{ color: 'var(--success)' }}>
            {successMessage}
          </p>
        </div>
      )}

      <div className="flex items-center justify-end gap-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border px-6 py-3 text-sm font-medium transition-all hover:opacity-80"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--surface)',
            color: 'var(--muted-foreground)'
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !canSubmit}
          className="rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            boxShadow: 'var(--accent-glow)'
          }}
          aria-busy={submitting}
        >
          {submitting ? "Creating..." : "Create Auction"}
        </button>
      </div>
    </form>
  );
};

