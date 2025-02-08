import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Reduce delay times
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Update the story prompt to be more intelligent
const getStoryPrompt = (prompt) => ({
  role: "system",
  content: `You are a visual storytelling expert. Create PURELY VISUAL scenes with NO TEXT OR DIALOGUE.

CRITICAL RULES:
1. ABSOLUTELY NO TEXT OR DIALOGUE - Pure visual storytelling only
2. Each scene must be purely visual - NO speech bubbles, NO text boxes
3. Focus on facial expressions and body language to convey meaning
4. Only use details explicitly stated in prompt
5. Characters must maintain EXACT same appearance in every panel
6. Environment must be perfectly consistent between panels

Parse this prompt into JSON with this structure:
{
  "characters": {
    "allCharacters": [
      {
        "name": "EXACTLY as mentioned in prompt",
        "role": "EXACTLY as mentioned in prompt",
        "gender": "EXACTLY as mentioned or 'not specified'",
        "age": "EXACTLY as mentioned or 'not specified'",
        "physicalTraits": {
          "build": "EXACTLY as mentioned or 'not specified'",
          "skinTone": "EXACTLY as mentioned or 'not specified'",
          "distinguishingFeatures": "EXACTLY as mentioned or 'not specified'"
        },
        "face": {
          "shape": "EXACTLY as mentioned or 'not specified'",
          "eyes": "EXACTLY as mentioned or 'not specified'",
          "nose": "EXACTLY as mentioned or 'not specified'",
          "mouth": "EXACTLY as mentioned or 'not specified'",
          "hair": "EXACTLY as mentioned or 'not specified'"
        },
        "clothing": {
          "mainOutfit": "EXACTLY as mentioned or 'not specified'",
          "accessories": "EXACTLY as mentioned or 'not specified'"
        }
      }
    ]
  },
  "setting": {
    "environment": "EXACTLY as mentioned or 'not specified'",
    "lighting": "EXACTLY as mentioned or 'not specified'",
    "timeOfDay": "EXACTLY as mentioned or 'not specified'",
    "weather": "EXACTLY as mentioned or 'not specified'",
    "props": "EXACTLY as mentioned or 'not specified'",
    "architecture": "EXACTLY as mentioned or 'not specified'"
  },
  "panels": [
    {
      "panelNumber": "panel number",
      "description": "COPY EXACT panel description from prompt",
      "characters": ["EXACTLY which characters appear in this panel"],
      "actions": {
        "characterName": "EXACT action described for this character"
      },
      "composition": "EXACTLY as mentioned or 'not specified'"
    }
  ]
}

CRITICAL INSTRUCTIONS:
1. Choose optimal number of panels (2-4) based on story complexity
2. Each panel must advance story visually
3. NO dialogue or text elements
4. Keep character details consistent
5. Use only explicitly stated details

USER'S PROMPT: "${prompt}"
Parse this prompt EXACTLY and create a JSON response with ONLY explicitly stated details. NO TEXT OR DIALOGUE ELEMENTS.`
});

// Add panel count validation to safeJSONParse
const safeJSONParse = (content, expectedPanels) => {
  try {
    // Remove any markdown formatting or backticks
    const cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Try to find the JSON object
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in content');
    }

    // Parse the JSON
    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required structure
    if (!parsed.characters?.allCharacters || !parsed.setting || !parsed.panels) {
      throw new Error('Invalid JSON structure');
    }

    // Validate panel count
    if (parsed.panels.length !== expectedPanels) {
      // Adjust panel count to match expected
      if (parsed.panels.length < expectedPanels) {
        // Add panels if we have too few
        while (parsed.panels.length < expectedPanels) {
          parsed.panels.push({
            ...parsed.panels[parsed.panels.length - 1],
            panelNumber: parsed.panels.length + 1
          });
        }
      } else {
        // Trim panels if we have too many
        parsed.panels = parsed.panels.slice(0, expectedPanels);
      }
    }

    return parsed;
  } catch (error) {
    console.error('JSON Parse Error:', error);
    console.log('Content:', content);
    throw new Error('Failed to parse story structure: ' + error.message);
  }
};

// Remove generateImages function and modify generateImage to create a single multi-panel image
const generateImage = async (story, style) => {
  const panels = story.panels.length;
  const mainChar = story.characters.allCharacters[0];
  
  const styleGuide = {
    manga: `
* PURE VISUAL MANGA STYLE:
* NO TEXT OR DIALOGUE WHATSOEVER
* NO speech bubbles or text boxes
* NO sound effects or onomatopoeia
* NO background text or signs
* Pure black and white art style
* Sharp, clean black linework
* High contrast shadows using screentone
* Dynamic speed lines for movement
* Dramatic camera angles
* Expressive faces to convey emotion
* Strong shadow placement
* Detailed backgrounds
* Classic manga proportions`,
    
    comic: `
* Bold American comic book style
* Strong, defined outlines
* Vibrant, saturated colors
* Dynamic action poses
* Dramatic lighting and shadows
* Heroic character proportions
* Rich color gradients
* Detailed environmental effects
* Classic comic book rendering
* Western art composition`,
    
    realistic: `
* Photorealistic rendering
* Natural lighting and shadows
* Accurate human proportions
* Detailed facial features
* Real-world textures
* Subtle color palette
* Accurate environmental details
* Realistic material rendering
* Natural pose dynamics
* Cinematic composition`
  }[style];

  const prompt = `Create a ${panels}-panel PURELY VISUAL manga sequence. ABSOLUTELY NO TEXT OF ANY KIND.

STRICT RULES - NO EXCEPTIONS:
1. NO TEXT ANYWHERE - Not even a single letter or number
2. NO speech bubbles or dialogue boxes
3. NO sound effects or written sounds
4. NO signs, posters, or written content in backgrounds
5. NO logos or brand names
6. NO graffiti or markings
7. Pure visual storytelling through expressions and actions only

CHARACTER CONSISTENCY (EXACT COPY BETWEEN PANELS):
Face (100% IDENTICAL):
- Shape: ${mainChar.face.shape || 'not specified'} (copy EXACTLY)
- Eyes: ${mainChar.face.eyes || 'not specified'} (duplicate PRECISELY)
- Nose: ${mainChar.face.nose || 'not specified'} (match PERFECTLY)
- Mouth: ${mainChar.face.mouth || 'not specified'} (replicate EXACTLY)
- Hair: ${mainChar.face.hair || 'not specified'} (copy EVERY detail)

Clothing (PERFECT MATCH):
- Outfit: ${mainChar.clothing.mainOutfit || 'not specified'} (duplicate ALL details)
- Every fold and wrinkle must match exactly
- All patterns and designs must be identical
- Accessories must be in same exact position

ENVIRONMENT (100% CONSISTENT):
- Setting: ${story.setting.environment || 'not specified'} (copy exactly)
- Time: ${story.setting.timeOfDay || 'not specified'} (same lighting)
- Weather: ${story.setting.weather || 'not specified'} (identical effects)
- Every background element must stay in same position

VISUAL SEQUENCE:
${story.panels.map((panel, index) => `
PANEL ${index + 1} - PURE VISUAL STORYTELLING:
Scene: ${panel.description}
Action: ${Object.values(panel.actions).join(', ')}
Composition: ${panel.composition || 'not specified'}
`).join('\n')}

FINAL VERIFICATION:
- Double check NO text appears anywhere
- Verify character features are pixel-perfect copies
- Confirm clothing details match exactly
- Ensure backgrounds are perfectly consistent
- Check NO accidental text or symbols appear`;

  return openai.images.generate({
    model: "dall-e-3",
    prompt,
    size: "1024x1024",
    quality: "standard",
    style: style === 'realistic' ? 'natural' : 'vivid',
  });
};

// Add content guidelines
const validatePrompt = (prompt) => {
  // More comprehensive safe replacements with milder alternatives
  const adaptations = {
    // Actions
    'fight': 'dance',
    'fighting': 'dancing',
    'battle': 'contest',
    'defeat': 'win',
    'attack': 'move',
    'hit': 'touch',
    'strike': 'reach',
    'kill': 'stop',
    'die': 'rest',
    'dead': 'still',
    'war': 'game',
    'weapon': 'prop',
    'blood': 'energy',
    'hurt': 'touch',
    'injury': 'moment',
    'wound': 'mark',
    'pain': 'feeling',
    'violent': 'active',
    'force': 'power',
    'destroy': 'change',
    'crush': 'press',
    'punch': 'wave',
    'kick': 'jump',
    'slash': 'swing',
    'stab': 'point',
    'shoot': 'aim',
    'gun': 'stick',
    'sword': 'staff',
    'knife': 'tool',
    'blade': 'edge',
    'bomb': 'ball',
    'explosion': 'flash',
    'gore': 'drama',
    'bloody': 'intense',
    'death': 'end',
    'murder': 'chase',
    'assault': 'rush',
    'victim': 'person',
    'harm': 'reach',
    'cruel': 'stern',
    'brutal': 'firm',
    'savage': 'wild',
    'vicious': 'quick',
    
    // Additional safe replacements
    'enemy': 'opponent',
    'villain': 'rival',
    'threat': 'challenge',
    'danger': 'risk',
    'scary': 'dramatic',
    'terrifying': 'surprising',
    'horror': 'mystery',
    'evil': 'mysterious',
    'demon': 'spirit',
    'monster': 'creature',
  };

  let safePrompt = prompt.toLowerCase();
  
  // Apply all replacements
  Object.entries(adaptations).forEach(([unsafe, safe]) => {
    const regex = new RegExp(`\\b${unsafe}\\b`, 'gi');
    safePrompt = safePrompt.replace(regex, safe);
  });

  // Additional safety measures
  safePrompt = safePrompt
    .replace(/\b(nsfw|explicit|adult|graphic|gore|blood|violent|weapon|kill|die|dead|wound|injury|hurt|harm|cruel|brutal|savage|vicious)\b/gi, '')
    .replace(/[!?]{2,}/g, '.') // Replace multiple punctuation
    .replace(/\s+/g, ' ')
    .trim();

  // Convert back to proper case
  safePrompt = safePrompt.charAt(0).toUpperCase() + safePrompt.slice(1);

  return safePrompt;
};

// Add story validation before image generation
const validateStory = (story) => {
  // Check for potentially problematic content in panel descriptions
  const forbiddenTerms = /\b(nsfw|explicit|adult|graphic|gore|blood|violent|weapon|kill|die|dead|wound|injury|hurt|harm|cruel|brutal|savage|vicious)\b/i;
  
  for (const panel of story.panels) {
    if (forbiddenTerms.test(panel.description)) {
      throw new Error('Story contains inappropriate content');
    }
  }
  return story;
};

// Update the POST function
export async function POST(req) {
  try {
    const { prompt, style } = await req.json();
    const safePrompt = validatePrompt(prompt);

    const scriptResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        getStoryPrompt(safePrompt),
        { role: "user", content: safePrompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const story = safeJSONParse(scriptResponse.choices[0].message.content);
    const validatedStory = validateStory(story);
    const response = await generateImage(validatedStory, style);

    return NextResponse.json({ 
      images: [{
        id: 'multi-panel',
        url: response.data[0].url
      }]
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate comic panels' },
      { status: error.status || 500 }
    );
  }
}; 