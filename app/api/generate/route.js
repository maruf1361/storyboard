import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Reduce delay times
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Update the story prompt to be more intelligent
const getStoryPrompt = (prompt, panels) => ({
  role: "system",
  content: `You are a master comic artist and storyteller. Take the user's simple prompt and expand it into a rich, detailed ${panels}-panel narrative. Add essential details for visual clarity while maintaining the core idea.

First, analyze the prompt to identify:
1. Main characters and their likely appearances
2. Actions or scenes to be depicted
3. Implied setting and atmosphere
4. Emotional tone and mood
5. Time period and context

Then, create a detailed JSON response:
{
  "characterDesign": {
    "mainCharacter": {
      "physicalTraits": "detailed appearance based on context",
      "face": {
        "eyes": "appropriate eye details",
        "hair": "fitting hairstyle and color",
        "features": "facial features matching character type"
      },
      "clothing": {
        "mainOutfit": "context-appropriate clothing with colors",
        "details": "relevant outfit details and decorations",
        "accessories": "fitting accessories for the character"
      }
    }
  },
  "setting": {
    "environment": "expanded setting description",
    "lighting": "appropriate lighting for the scene",
    "timeOfDay": "time and atmosphere that fits the story"
  },
  "panels": [
    {
      "description": "expanded scene description with clear visual direction",
      "cameraAngle": "most effective viewpoint for the scene"
    }
  ]
}

Example:
If user says "an army general dancing with his wife":
- Infer formal military uniform with medals and decorations
- Assume elegant evening wear for the wife
- Set in a grand ballroom or formal event space
- Add appropriate lighting like chandeliers
- Include background details like other dancers
- Consider the emotional warmth of the moment

Always maintain visual consistency across panels while expanding the basic prompt into a rich, detailed scene.`
});

// Add a safe JSON parser
const safeJSONParse = (content) => {
  try {
    // Remove any markdown formatting or backticks if present
    const cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('JSON Parse Error:', error);
    console.log('Content:', content);
    throw new Error('Failed to parse story structure');
  }
};

// Update the generateImage function
const generateImage = async (panelIndex, style, story, panels) => {
  const characterConsistency = `
Character must be EXACTLY the same across all panels:
- Physical: ${story.characterDesign.mainCharacter.physicalTraits}
- Eyes: ${story.characterDesign.mainCharacter.face?.eyes || 'as established'}
- Hair: ${story.characterDesign.mainCharacter.face?.hair || 'as established'}
- Face: ${story.characterDesign.mainCharacter.face?.features || 'as established'}
- Outfit: ${story.characterDesign.mainCharacter.clothing?.mainOutfit || 'as established'}
- Details: ${story.characterDesign.mainCharacter.clothing?.details || 'as established'}
- Accessories: ${story.characterDesign.mainCharacter.clothing?.accessories || 'as established'}`;

  const layoutGuide = {
    1: "Single full-page panel",
    2: "Two equal-sized panels arranged horizontally",
    3: "Three panels: two equal panels on top row, one wider panel below",
    4: "Four equal-sized panels in a 2x2 grid"
  };

  const styleGuide = {
    manga: `
      Style: Traditional Japanese manga illustration
      ${characterConsistency}
      Layout: ${layoutGuide[panels]}
      
      Specific manga elements:
      - Large, expressive anime eyes with highlights
      - Distinctive manga facial features
      - Dynamic panel composition
      - Strong black and white contrast
      - Clear panel borders with gutters
      - Manga-style speed lines and effects
      
      Panel requirements:
      - Each panel must be clearly separated
      - Maintain consistent art style across panels
      - Use dramatic angles and perspectives
      - Include proper panel gutters (white space between panels)
    `,
    comic: `
      Style: Comic book illustration
      ${characterConsistency}
      Layout: ${layoutGuide[panels]}
      
      Panel requirements:
      - Clear panel borders with gutters
      - Consistent color palette across panels
      - Dynamic comic book composition
      - Professional panel layout
    `,
    realistic: `
      Style: Realistic illustration
      ${characterConsistency}
      Layout: ${layoutGuide[panels]}
      
      Panel requirements:
      - Cinematic panel composition
      - Photorealistic style across panels
      - Natural lighting and shadows
      - Clear panel separation
    `
  };

  // Create a combined panel description
  const panelDescriptions = story.panels.map((panel, idx) => 
    `Panel ${idx + 1}:
    ${panel.description}
    Camera: ${panel.cameraAngle}`
  ).join('\n\n');

  return openai.images.generate({
    model: "dall-e-3",
    prompt: `Create a ${style} style comic page with ${panels} panels.

Art direction: ${styleGuide[style]}

Scene setting:
- Location: ${story.setting.environment}
- Time: ${story.setting.timeOfDay}
- Lighting: ${story.setting.lighting}

Panel Layout:
${layoutGuide[panels]}

Panel Descriptions:
${panelDescriptions}

Critical requirements:
- Create a SINGLE IMAGE containing all ${panels} panels
- Include clear panel borders and gutters
- Maintain consistent style across all panels
- Ensure proper panel flow and reading order
- Keep characters consistent across all panels`,
    size: "1024x1024",
    quality: "standard",
    style: style === 'realistic' ? 'natural' : 'vivid',
  });
};

// Update the generateImages function to only generate one image
const generateImages = async (story, style, panels) => {
  try {
    const response = await generateImage(0, style, story, panels);
    return [{
      id: 'comic-page',
      url: response.data[0].url
    }];
  } catch (error) {
    if (error.code === 'rate_limit_exceeded') {
      await delay(2000);
      return generateImages(story, style, panels);
    }
    throw error;
  }
};

export async function POST(req) {
  try {
    const { prompt, style, panels } = await req.json();

    const scriptResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        getStoryPrompt(prompt, panels),
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" } // Force JSON response
    });

    // Use the safe parser
    const story = safeJSONParse(scriptResponse.choices[0].message.content);

    // Generate images in parallel batches
    const images = await generateImages(story, style, panels);

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate comic panels' },
      { status: error.status || 500 }
    );
  }
} 