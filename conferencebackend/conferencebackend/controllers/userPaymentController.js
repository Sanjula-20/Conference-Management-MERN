import { db } from "../config/db.js";
import { userPaymentModel } from "../models/userPaymentModel.js";
import { paymentModel } from "../models/paymentModel.js";
import { conferenceConfigModel } from "../models/conferenceConfigModel.js";

const PAYMENT_CURRENCY = "INR";

const ACCEPTED_STATUSES = [
  "accepted",
  "accepted_with_minor_revision",
  "accepted_with_major_revision"
];

const normalizeType = (value) => {
  if (!value) return "";
  const normalized = value.toString().trim().toLowerCase().replace(/\s+/g, "_");
  if (normalized.includes("ug")) return "ug_student";
  if (normalized.includes("pg")) return "pg_student";
  if (normalized.includes("faculty")) return "faculty";
  if (normalized.includes("industry")) return "industry";
  return normalized;
};

const parseAuthors = (authors) => {
  if (!authors) return [];
  if (Array.isArray(authors)) return authors;
  if (typeof authors === "string") {
    try {
      const parsed = JSON.parse(authors);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const sanitizeIndexes = (indexes, authorsLength) => {
  if (!Array.isArray(indexes)) return [];
  const cleaned = indexes
    .map((idx) => Number.parseInt(idx, 10))
    .filter((idx) => Number.isInteger(idx) && idx >= 0 && idx < authorsLength);
  return Array.from(new Set(cleaned));
};

export const prepareUserPayment = async (req, res) => {
  try {
    const { paperId, presentationMode, stayRequired, participantIndexes } = req.body;
    const userId = req.user.id;

    if (!paperId) {
      return res.status(400).json({ error: "Paper ID is required" });
    }
    if (!presentationMode || !["online", "offline"].includes(presentationMode)) {
      return res.status(400).json({ error: "Presentation mode must be online or offline" });
    }

    const paperQuery = "SELECT * FROM registrations WHERE id = ? AND userId = ?";
    db.query(paperQuery, [paperId, userId], (err, papers) => {
      if (err) {
        console.error("Error fetching paper:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (!papers || papers.length === 0) {
        return res.status(404).json({ error: "Paper not found" });
      }

      const paper = papers[0];
      const isAccepted =
        ACCEPTED_STATUSES.includes(paper.status) ||
        ACCEPTED_STATUSES.includes(paper.reviewStatus);

      if (!paper.notificationSent || !isAccepted) {
        return res.status(400).json({
          error: "Payment is available only for accepted papers after notification",
          code: "PAYMENT_NOT_AVAILABLE"
        });
      }

      const authors = parseAuthors(paper.authors);
      if (!authors.length) {
        return res.status(400).json({ error: "Author details not found for this paper" });
      }

      const mainType = normalizeType(authors[0]?.type);
      conferenceConfigModel.getPricing(mainType, paper.country).then((pricing) => {
        if (!pricing) {
          return res.status(400).json({ error: "No payment rate is configured for the main author type", code: "INVALID_AUTHOR_TYPE" });
        }
        paymentModel.getCustomAmountByPaperId(paperId, (customErr, customAmount) => {
        let baseAmount = pricing.baseAmount;
        if (!customErr && customAmount && Number.isInteger(customAmount) && customAmount > 0) {
          baseAmount = customAmount;
        }

        if (!baseAmount) {
          return res.status(400).json({
            error: "Unable to determine base amount for the main author type",
            code: "INVALID_AUTHOR_TYPE"
          });
        }

        const cleanedIndexes = sanitizeIndexes(participantIndexes, authors.length);
        if (!cleanedIndexes.includes(0)) {
          cleanedIndexes.unshift(0);
        }

        const additionalParticipants = Math.max(0, cleanedIndexes.length - 1);
        const additionalAmount = presentationMode === "online" ? 0 : additionalParticipants * pricing.additionalAmount;
        const totalAmount = baseAmount + additionalAmount;

        userPaymentModel.upsertPaymentConfig(
          {
            paperId,
            userId,
            presentationMode,
            stayRequired: !!stayRequired,
            participantIndexes: cleanedIndexes,
            baseCategory: pricing.baseCategory,
            baseAmount,
            additionalParticipants,
            additionalAmount,
            totalAmount,
            currency: pricing.currency
          },
          (saveErr) => {
            if (saveErr) {
              return res.status(500).json({ error: "Failed to save payment details" });
            }

            return res.status(200).json({
              paperId,
              presentationMode,
              stayRequired: !!stayRequired,
              participantIndexes: cleanedIndexes,
              baseCategory: pricing.baseCategory,
              baseAmount,
              additionalParticipants,
              additionalAmount,
              totalAmount,
              currency: pricing.currency
            });
          }
        );
        });
      }).catch((pricingError) => {
        console.error("Error loading payment rate:", pricingError);
        return res.status(500).json({ error: "Unable to load payment rate" });
      });
    });
  } catch (error) {
    console.error("Prepare user payment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserPaymentConfig = async (req, res) => {
  try {
    const { paperId } = req.params;
    const userId = req.user.id;

    if (!paperId) {
      return res.status(400).json({ error: "Paper ID is required" });
    }

    const paperQuery = "SELECT * FROM registrations WHERE id = ? AND userId = ?";
    db.query(paperQuery, [paperId, userId], (err, papers) => {
      if (err) {
        console.error("Error fetching paper:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (!papers || papers.length === 0) {
        return res.status(404).json({ error: "Paper not found" });
      }

      userPaymentModel.getPaymentConfigByPaperId(paperId, (configErr, config) => {
        if (configErr) {
          return res.status(500).json({ error: "Error fetching payment config" });
        }

        paymentModel.getCustomAmountByPaperId(paperId, (customErr, customAmount) => {
          const hasCustom = !customErr && customAmount && Number.isInteger(customAmount) && customAmount > 0;

          if (!config) {
            return res.status(200).json({
              paperId: Number(paperId),
              presentationMode: null,
              stayRequired: false,
              participantIndexes: [],
              baseCategory: null,
              baseAmount: hasCustom ? customAmount : null,
              additionalParticipants: 0,
              additionalAmount: 0,
              totalAmount: hasCustom ? customAmount : null,
              customAmount: hasCustom ? customAmount : null,
              currency: PAYMENT_CURRENCY
            });
          }

          let participantIndexes = [];
          try {
            participantIndexes = config.participantIndexes
              ? JSON.parse(config.participantIndexes)
              : [];
          } catch {
            participantIndexes = [];
          }

          const effectiveBase = hasCustom ? customAmount : config.baseAmount;
          const effectiveTotal = hasCustom ? customAmount + (config.additionalAmount || 0) : config.totalAmount;

          return res.status(200).json({
            paperId: config.paperId,
            presentationMode: config.presentationMode,
            stayRequired: !!config.stayRequired,
            participantIndexes,
            baseCategory: config.baseCategory,
            baseAmount: effectiveBase,
            additionalParticipants: config.additionalParticipants,
            additionalAmount: config.additionalAmount,
            totalAmount: effectiveTotal,
            customAmount: hasCustom ? customAmount : null,
            currency: config.currency || PAYMENT_CURRENCY
          });
        });
      });
    });
  } catch (error) {
    console.error("Get user payment config error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default {
  prepareUserPayment,
  getUserPaymentConfig
};
