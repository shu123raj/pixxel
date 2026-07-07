// File Path: lib/faqs.js
// Per-page FAQ data — FAQPage JSON-LD isi se generate hota hai.
// RULE (Google): schema mein wahi questions hone chahiye jo page par
// VISIBLE hain. Jin pages ka apna FAQ section page.jsx mein already
// hai (background, ecommerce, sky, Pixxel, pricing, landscape), unka
// data yahan EXACT COPY hai. Jin pages par FAQ section nahi tha,
// unke liye FaqSection component page mein render hota hai (hasVisibleSection
// dekho — woh pages page.jsx mein <FaqSection> se render karte hain).

export const FAQS = {
  // ── Existing visible FAQs (page.jsx ke content ki exact copy) ──
  "/background": [
    { question: "What is Background Removal AI?", answer: "The Pixxel OS AI BG remover is designed to make erasing backgrounds easy and fast. This tool eliminates hours of tedious work by automating the process of selecting and cutting out backgrounds in just a few clicks." },
    { question: "Why do you need an AI-powered background remover?", answer: "It allows you to cleanly isolate your subject without spending hours on complex masking, making it perfect for e-commerce, portraits, and creative edits." },
    { question: "How can I erase the background of a photo?", answer: "Just open your photo in Pixxel OS, select the Background Removal tool, and let the AI automatically detect the subject. Click remove, and you're done!" },
    { question: "Can I use AI to remove backgrounds in a batch?", answer: "Yes, our batch processing feature allows you to apply the same AI background removal settings to multiple photos at once, saving you significant time." },
  ],
  "/ecommerce": [
    { question: "What image formats are supported?", answer: "Our platform supports JPG, JPEG, PNG, WebP, AVIF, and other widely used image formats for seamless editing." },
    { question: "Can AI remove blur from photos?", answer: "Yes. Our advanced AI models can sharpen blurry images, recover lost details, and improve overall image clarity." },
    { question: "Does the editor improve low-resolution images?", answer: "Absolutely. AI upscaling enhances image resolution while preserving textures and natural details." },
    { question: "Can I remove unwanted objects from photos?", answer: "Yes. AI object removal can erase people, objects, distractions, and background elements with realistic results." },
    { question: "Is batch editing available?", answer: "Yes. Process multiple images simultaneously to save time and maintain consistent editing across projects." },
  ],
  "/sky": [
    { question: "What image formats are supported?", answer: "Our platform supports JPG, JPEG, PNG, WebP, AVIF, and other widely used image formats for seamless editing." },
    { question: "Can AI remove blur from photos?", answer: "Yes. Our advanced AI models can sharpen blurry images, recover lost details, and improve overall image clarity." },
    { question: "Does the editor improve low-resolution images?", answer: "Absolutely. AI upscaling enhances image resolution while preserving textures and natural details." },
    { question: "Can I remove unwanted objects from photos?", answer: "Yes. AI object removal can erase people, objects, distractions, and background elements with realistic results." },
    { question: "Is batch editing available?", answer: "Yes. Process multiple images simultaneously to save time and maintain consistent editing across projects." },
  ],
  "/Pixxel": [
    { question: "What image formats are supported?", answer: "Our platform supports JPG, JPEG, PNG, WebP, AVIF, and other widely used image formats for seamless editing." },
    { question: "Can AI remove blur from photos?", answer: "Yes. Our advanced AI models can sharpen blurry images, recover lost details, and improve overall image clarity." },
    { question: "Does the editor improve low-resolution images?", answer: "Absolutely. AI upscaling enhances image resolution while preserving textures and natural details." },
    { question: "Can I remove unwanted objects from photos?", answer: "Yes. AI object removal can erase people, objects, distractions, and background elements with realistic results." },
    { question: "Is batch editing available?", answer: "Yes. Process multiple images simultaneously to save time and maintain consistent editing across projects." },
  ],
  "/pricing": [
    { question: "What is the difference between Pixxel OS plans?", answer: "Our plans range from desktop-only to full cross-device capability with mobile access and our premium creative library." },
    { question: "Can I start editing on one device and finish on another?", answer: "Yes! With our Cross-device and Max licenses, your projects are synced across all platforms seamlessly." },
    { question: "How will I access the Generative tools or new upgrades after a year?", answer: "Perpetual licenses include core AI tools. Major new generative models may require a small upgrade fee or are included in the Max subscription." },
    { question: "What payment methods are available?", answer: "We accept all major credit cards, PayPal, Amazon Pay, and various regional payment methods." },
  ],
  "/landscape": [
    { question: "What image formats are supported?", answer: "Our platform supports JPG, JPEG, PNG, WebP, AVIF, and other widely used image formats for seamless editing." },
    { question: "Can AI remove blur from photos?", answer: "Yes. Our advanced AI models can sharpen blurry images, recover lost details, and improve overall image clarity." },
    { question: "Does the editor improve low-resolution images?", answer: "Absolutely. AI upscaling enhances image resolution while preserving textures and natural details." },
    { question: "Can I remove unwanted objects from photos?", answer: "Yes. AI object removal can erase people, objects, distractions, and background elements with realistic results." },
    { question: "Is batch editing available?", answer: "Yes. Process multiple images simultaneously to save time and maintain consistent editing across projects." },
  ],

  // ── Naye FAQs (in pages par FaqSection component render hota hai) ──
  "/bokeh": [
    { question: "How do I add a bokeh effect to a photo online?", answer: "Upload your photo to Pixxel, open the AI Bokeh tool, and the AI automatically detects your subject and applies natural DSLR-style background blur. You can adjust blur strength before downloading." },
    { question: "Can AI bokeh look as good as a real camera lens?", answer: "Yes. Pixxel's depth-aware AI separates subject from background and applies graduated blur that mimics wide-aperture lenses like f/1.8, including realistic light-circle bokeh highlights." },
    { question: "Can I blur the background of a photo without Photoshop?", answer: "Absolutely. Pixxel works entirely in your browser — no downloads or editing skills needed. One click gives you professional portrait depth-of-field." },
    { question: "Does the bokeh effect work on group photos?", answer: "Yes. The AI detects multiple subjects and keeps everyone in focus while blurring only the background behind them." },
    { question: "Is the AI bokeh tool free to use?", answer: "Yes, you can try the bokeh effect free on Pixxel. Premium plans unlock higher-resolution exports and batch processing." },
  ],
  "/face": [
    { question: "How does AI face retouching work?", answer: "Pixxel's AI detects facial features automatically and applies natural enhancements — smoothing skin, brightening eyes, and balancing tones — while preserving your natural look." },
    { question: "Will retouched portraits look fake or over-edited?", answer: "No. Pixxel is designed for authentic results: texture-preserving skin smoothing and subtle feature enhancement, so portraits stay natural, never plastic." },
    { question: "Can I retouch selfies as well as professional portraits?", answer: "Yes. The AI face editor works on selfies, studio portraits, and casual photos alike — any image with a detectable face." },
    { question: "Does face retouch work on multiple faces in one photo?", answer: "Yes. Pixxel detects and retouches every face in a group shot individually for consistent, natural results." },
    { question: "Is the AI portrait editor free?", answer: "You can retouch portraits free with Pixxel. Premium plans add high-resolution exports and advanced retouching controls." },
  ],
  "/skin": [
    { question: "How do I smooth skin in photos without losing texture?", answer: "Pixxel's AI skin retouching separates skin tone from texture, removing blemishes and evening tone while keeping natural pores and detail — no plastic look." },
    { question: "Can AI remove acne and blemishes from photos?", answer: "Yes. The AI detects and removes acne, spots, scars, and temporary blemishes automatically while leaving permanent features like freckles intact if you choose." },
    { question: "Does the skin editor work on all skin tones?", answer: "Yes. Pixxel's AI is trained on diverse skin tones and adjusts its retouching to keep every complexion looking natural and true to life." },
    { question: "Can I even out skin tone in a photo online?", answer: "Absolutely. The AI balances redness, dark spots, and uneven patches in one click, right in your browser." },
    { question: "Is AI skin retouching free to try?", answer: "Yes, you can try skin retouching free on Pixxel. Upgrade for batch retouching and full-resolution downloads." },
  ],
  "/hdr": [
    { question: "What does the AI HDR effect do?", answer: "It balances shadows and highlights, recovers lost detail, and boosts color depth — giving photos the dramatic high-dynamic-range look without bracketed exposures." },
    { question: "Can I create an HDR effect from a single photo?", answer: "Yes. Unlike traditional HDR that needs multiple exposures, Pixxel's AI generates the HDR look from one image by intelligently remapping tones." },
    { question: "Will HDR make my photos look unnatural?", answer: "You control the intensity. Pixxel offers everything from subtle dynamic-range recovery to bold, dramatic HDR styles." },
    { question: "Which photos benefit most from HDR enhancement?", answer: "Landscapes, real estate, cityscapes, and backlit shots benefit most — anywhere bright skies and dark shadows appear in the same frame." },
    { question: "Is the HDR photo editor free online?", answer: "Yes, you can apply AI HDR effects free in your browser. Premium unlocks high-resolution exports and batch HDR processing." },
  ],
  "/wildlife": [
    { question: "How does AI enhance wildlife photos?", answer: "Pixxel sharpens fur and feather detail, reduces high-ISO noise from long lenses, fixes low-light exposure, and makes animal subjects stand out naturally." },
    { question: "Can AI fix noisy wildlife photos shot at high ISO?", answer: "Yes. AI noise reduction removes grain from dawn, dusk, and fast-shutter shots while preserving fine detail like fur texture and feather edges." },
    { question: "Can I blur a distracting background behind an animal?", answer: "Absolutely. The AI isolates your animal subject and applies natural background blur, drawing the eye exactly where you want it." },
    { question: "Does the editor work on bird and safari photography?", answer: "Yes. From backyard birds to safari big game, the AI handles feathers, fur, and challenging natural light equally well." },
    { question: "Is the wildlife photo editor free?", answer: "You can enhance wildlife shots free on Pixxel. Premium plans add batch editing for full photo sessions and RAW-quality exports." },
  ],
  "/family": [
    { question: "Can AI fix a group photo where someone is too dark?", answer: "Yes. Pixxel balances exposure per person — fixing shadows on faces, backlit subjects, and uneven lighting in one click." },
    { question: "Can I restore old or damaged family photos?", answer: "Yes. AI photo restoration repairs fading, scratches, and blur in scanned family pictures, bringing decades-old memories back to life." },
    { question: "How do I make everyone look good in a family portrait?", answer: "The AI retouches every detected face individually — natural skin smoothing, brightened eyes, and balanced tones for the whole group." },
    { question: "Does it work on old scanned photographs?", answer: "Absolutely. Scan your print, upload it to Pixxel, and the AI enhances resolution, color, and clarity automatically." },
    { question: "Is the family photo editor free to use?", answer: "Yes, you can enhance family photos free. Premium adds high-resolution restoration and batch processing for whole albums." },
  ],
  "/demo": [
    { question: "Can I try the AI photo editor without signing up?", answer: "Yes. The live demo lets you see portrait enhancement, background removal, and color correction in action right in your browser." },
    { question: "What AI tools are shown in the demo?", answer: "The demo showcases face retouching, AI background removal, sky replacement, HDR enhancement, and one-click color correction." },
    { question: "Do I need to download anything to use Pixxel?", answer: "No. Pixxel runs entirely in your web browser on desktop and mobile — no installation required." },
    { question: "Is the demo free?", answer: "Yes, the demo is completely free. Create a free account when you're ready to edit and save your own photos." },
  ],
  "/pixxel-os": [
    { question: "What is Pixxel OS?", answer: "Pixxel OS is the desktop-class version of Pixxel's AI photo editor, with cloud sync that lets you start an edit on one device and finish on another." },
    { question: "Which platforms does Pixxel OS support?", answer: "Pixxel OS runs on Windows and macOS desktops, with companion access on tablet and mobile through the Pixxel cloud engine." },
    { question: "Do my projects sync across devices?", answer: "Yes. With cross-device plans, every project, preset, and edit history syncs automatically through the cloud." },
    { question: "Can I use Pixxel OS offline?", answer: "Core editing tools work offline on desktop; AI-powered features and sync require an internet connection." },
    { question: "Is Pixxel OS included in the free plan?", answer: "The free plan covers the web editor. Pixxel OS desktop is part of paid plans — see the pricing page for details." },
  ],
};

/** Kya is path ke liye layout FaqSection render kare? (jin pages ke
 * page.jsx mein already visible FAQ hai, unke liye false) */
export const PAGES_WITH_OWN_FAQ_UI = [
  "/background",
  "/ecommerce",
  "/sky",
  "/Pixxel",
  "/pricing",
  "/landscape",
];
