import { conferenceConfigModel } from "../models/conferenceConfigModel.js";

export const getRegistrationOptions = async (_req, res) => {
  try {
    res.json(await conferenceConfigModel.getRegistrationOptions());
  } catch (error) {
    console.error("Unable to load registration configuration:", error);
    res.status(500).json({ error: "Unable to load registration configuration" });
  }
};

export const getPaymentRate = async (req, res) => {
  try {
    const { authorType, country } = req.query;
    if (!authorType || !country) return res.status(400).json({ error: "authorType and country are required" });
    const pricing = await conferenceConfigModel.getPricing(authorType, country);
    if (!pricing) return res.status(404).json({ error: "No payment rate is configured for this author type" });
    res.json(pricing);
  } catch (error) {
    console.error("Unable to load payment rate:", error);
    res.status(500).json({ error: "Unable to load payment rate" });
  }
};
