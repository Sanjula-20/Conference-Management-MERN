import { TranslationServiceClient } from '@google-cloud/translate';

const client = new TranslationServiceClient({
  keyFilename: './service-account.json', // Update this path to your actual service account key file
});

export const translateText = async (text, targetLang) => {
  try {
    const [response] = await client.translateText({
      parent: `projects/YOUR_PROJECT_ID/locations/global`, // Replace YOUR_PROJECT_ID with your actual project ID
      contents: [text],
      mimeType: 'text/plain',
      targetLanguageCode: targetLang,
    });
    return response.translations[0].translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback to original text
  }
};
