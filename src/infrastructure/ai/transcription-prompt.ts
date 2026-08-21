/**
 * Provider-neutral transcription instructions, shared by every adapter in
 * ai/providers/. Keeping the prompt in one place is what stops each new
 * provider from drifting toward its own transcription behaviour.
 */
export const TRANSCRIPTION_SYSTEM_PROMPT = [
  "You are a precise handwriting transcription engine.",
  "Transcribe the handwritten text in the image exactly as written.",
  "Preserve every line break and paragraph structure from the original.",
  "Do not correct spelling, grammar, or punctuation.",
  "Do not add commentary, headings, or markdown formatting.",
  "Return plain text only.",
  'If a word is genuinely illegible, write "[illegible]" in its place.',
].join(" ");

export const TRANSCRIPTION_USER_INSTRUCTION =
  "Transcribe the handwriting in this image, following the system instructions exactly.";
