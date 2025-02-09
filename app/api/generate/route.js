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
  content: `You are a visual storytelling expert. Convert user's story into PURELY VISUAL sequential scenes.
Return your response as a JSON object with the following structure.

CRITICAL RULES:
1. ABSOLUTELY NO TEXT OR DIALOGUE
2. Each panel must be a clear, distinct scene
3. Characters must be visually distinguishable
4. Each character must maintain exact appearance across all panels
5. Story must follow logical visual progression
6. Environment must stay consistent within same location

REQUIRED JSON STRUCTURE:
{
  "characters": {
    "allCharacters": [
      {
        "identifier": "unique visual trait to distinguish this character",
        "role": "character's role in story",
        "physicalTraits": {
          "build": "distinctive body type",
          "height": "relative to other characters",
          "distinguishingFeatures": "unique visual elements"
        },
        "face": {
          "shape": "distinctive face shape",
          "eyes": "unique eye characteristics",
          "hair": "distinctive hairstyle and color",
          "uniqueFeatures": "any distinguishing facial features"
        },
        "clothing": {
          "mainOutfit": "distinctive outfit description",
          "uniqueAccessories": "character-specific items"
        }
      }
    ]
  },
  "setting": {
    "environment": "detailed scene description",
    "timeOfDay": "specific lighting condition",
    "weather": "atmospheric conditions",
    "keyObjects": "important scene elements"
  },
  "panels": [
    {
      "panelNumber": "sequential number",
      "scene": "clear visual description",
      "presentCharacters": ["which characters appear"],
      "characterActions": {
        "characterIdentifier": "specific visual action"
      },
      "sceneComposition": "how the scene is framed"
    }
  ]
}

PANEL GUIDELINES:
1. Each panel must show clear story progression
2. Characters must be instantly recognizable
3. Actions must be clearly visible
4. Scenes must be well-composed
5. Important story elements must be prominent

USER PROMPT: "${prompt}"
Parse this prompt and return a JSON object that creates a visual narrative without any text or dialogue.`
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
  const characters = story.characters.allCharacters;
  
  const artStyle = {
    manga: `
* Pure black and white art with high contrast
* Distinctive character designs
* Clear visual storytelling
* Dynamic compositions
* Expressive character poses
* Detailed backgrounds
* NO text or speech bubbles`,
    
    comic: `
* Bold color palette
* Clear character distinctions
* Strong visual narrative
* Dynamic action scenes
* Expressive character poses
* Detailed environments
* NO text or speech bubbles`,
    
    realistic: `
* Natural lighting and colors
* Realistic character features
* Clear visual storytelling
* Natural compositions
* Lifelike expressions
* Detailed settings
* NO text or speech bubbles`
  }[style];

  const characterDescriptions = characters.map(char => `
Character "${char.identifier}":
- Appearance: ${char.physicalTraits.distinguishingFeatures}
- Face: ${char.face.uniqueFeatures}
- Hair: ${char.face.hair}
- Outfit: ${char.clothing.mainOutfit}
- Accessories: ${char.clothing.uniqueAccessories}
MUST REMAIN 100% IDENTICAL IN ALL APPEARANCES`).join('\n');

  const prompt = `Create a ${panels}-panel visual story.

STYLE GUIDE:
${artStyle}

CHARACTERS (MUST STAY CONSISTENT):
${characterDescriptions}

SETTING:
- Environment: ${story.setting.environment}
- Time: ${story.setting.timeOfDay}
- Weather: ${story.setting.weather}
- Key Elements: ${story.setting.keyObjects}

STORY PANELS:
${story.panels.map((panel, index) => `
PANEL ${index + 1}:
Scene: ${panel.scene}
Present: ${panel.presentCharacters.join(', ')}
Actions: ${Object.entries(panel.characterActions).map(([char, action]) => `${char}: ${action}`).join(', ')}
Composition: ${panel.sceneComposition}
NOTE: Characters must be instantly recognizable and identical to other panels`).join('\n')}

CRITICAL REQUIREMENTS:
1. NO text, speech bubbles, or written elements
2. Each character must be visually distinct
3. Characters must be 100% consistent between panels
4. Each panel must clearly show the story progression
5. Maintain exact same character designs throughout
6. Keep environment consistent within same location
7. Make characters instantly recognizable
8. Do not add any text or dialogue. No speech bubbles.

IMPORTANT: Pure visual storytelling only - NO text elements of any kind.`;

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