import { NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req) {
  try {
    const { imageUrl, dialogues, thoughts } = await req.json();

    // Fetch the image first
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    // Create an SVG overlay for the bubbles
    const svgOverlay = `
      <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            @font-face {
              font-family: 'Comic Sans MS';
              src: local('Comic Sans MS');
            }
            .bubble-text {
              font-family: 'Comic Sans MS', cursive;
              font-size: 12px;
              white-space: pre-wrap;
              inline-size: 80px;
              text-align: center;
            }
          </style>
        </defs>
        ${dialogues?.map(d => {
          // Split text into lines (roughly 15 chars per line)
          const words = d.text.split(' ');
          let lines = [];
          let currentLine = '';
          
          words.forEach(word => {
            if ((currentLine + ' ' + word).length > 15) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = currentLine ? `${currentLine} ${word}` : word;
            }
          });
          if (currentLine) {
            lines.push(currentLine);
          }

          // Calculate bubble size based on text length
          const lineCount = lines.length;
          const bubbleHeight = Math.max(40, lineCount * 15 + 20); // min height 40px
          const bubbleWidth = Math.max(80, Math.min(120, d.text.length * 5)); // min 80px, max 120px

          return `
            <g transform="translate(${d.position.x * 10.24}, ${d.position.y * 10.24})">
              <filter id="shadow${d.position.x}" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.1"/>
              </filter>
              <path d="M -${bubbleWidth/2} -${bubbleHeight/2} 
                       H ${bubbleWidth/2} 
                       Q ${bubbleWidth/2 + 10} -${bubbleHeight/2} ${bubbleWidth/2 + 10} -${bubbleHeight/2 - 10} 
                       V ${bubbleHeight/2 - 10} 
                       Q ${bubbleWidth/2 + 10} ${bubbleHeight/2} ${bubbleWidth/2} ${bubbleHeight/2} 
                       H -${bubbleWidth/2} 
                       Q -${bubbleWidth/2 + 10} ${bubbleHeight/2} -${bubbleWidth/2 + 10} ${bubbleHeight/2 - 10} 
                       V -${bubbleHeight/2 - 10} 
                       Q -${bubbleWidth/2 + 10} -${bubbleHeight/2} -${bubbleWidth/2} -${bubbleHeight/2} Z" 
                    fill="white" 
                    filter="url(#shadow${d.position.x})"
              />
              <path d="M -5 ${bubbleHeight/2} L 0 ${bubbleHeight/2 + 10} L 5 ${bubbleHeight/2}" fill="white"/>
              ${lines.map((line, i) => `
                <text 
                  x="0" 
                  y="${-bubbleHeight/2 + 20 + (i * 15)}"
                  text-anchor="middle" 
                  class="bubble-text"
                  fill="black"
                >${line}</text>
              `).join('')}
            </g>
          `;
        }).join('')}
        
        ${thoughts?.map(t => {
          // Similar text wrapping for thought bubbles
          const words = t.text.split(' ');
          let lines = [];
          let currentLine = '';
          
          words.forEach(word => {
            if ((currentLine + ' ' + word).length > 15) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = currentLine ? `${currentLine} ${word}` : word;
            }
          });
          if (currentLine) {
            lines.push(currentLine);
          }

          const lineCount = lines.length;
          const bubbleSize = Math.max(40, Math.min(80, lineCount * 15 + 20));

          return `
            <g transform="translate(${t.position.x * 10.24}, ${t.position.y * 10.24})">
              <filter id="thoughtShadow${t.position.x}" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.1"/>
              </filter>
              <circle 
                cx="0" 
                cy="0" 
                r="${bubbleSize/2}"
                fill="white" 
                filter="url(#thoughtShadow${t.position.x})"
              />
              <circle cx="0" cy="${bubbleSize/2 + 15}" r="5" fill="white"/>
              <circle cx="0" cy="${bubbleSize/2 + 25}" r="3" fill="white"/>
              <circle cx="0" cy="${bubbleSize/2 + 33}" r="2" fill="white"/>
              ${lines.map((line, i) => `
                <text 
                  x="0" 
                  y="${-bubbleSize/2 + 20 + (i * 15)}"
                  text-anchor="middle" 
                  class="bubble-text"
                  fill="black"
                >${line}</text>
              `).join('')}
            </g>
          `;
        }).join('')}
      </svg>
    `;

    // Process image with sharp
    const processedImage = await sharp(Buffer.from(imageBuffer))
      .resize(1024, 1024, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .composite([
        {
          input: Buffer.from(svgOverlay),
          top: 0,
          left: 0
        }
      ])
      .png()
      .toBuffer();

    return new NextResponse(processedImage, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="panel.png"',
      },
    });
  } catch (error) {
    console.error('Capture error:', error);
    return NextResponse.json(
      { error: 'Failed to capture panel' },
      { status: 500 }
    );
  }
} 