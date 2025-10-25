const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const cacheDir = path.join(process.cwd(), 'cache')
const generateSummaryImage = async (countries, lastRefreshedAt) => {
  // Define the output path in the cache folder
  const outputPath = path.join(cacheDir, 'summary.png');

  // 1. Data Calculation (as defined in your request)
  const total = countries.length;
  
  const top5 = [...countries]
      // Filter out countries without GDP data and sort them
      .filter(c => c.estimated_gdp && typeof c.estimated_gdp === 'number')
      .sort((a, b) => b.estimated_gdp - a.estimated_gdp)
      .slice(0, 5);

  // 2. SVG Content Generation
  
  // Map the top 5 countries into SVG <text> elements
  const topCountriesSVG = top5
      .map((c, i) => {
          // Convert GDP from base unit (e.g., dollars) to Trillions for display
          const gdpInTrillions = (c.estimated_gdp / 1e12).toFixed(2);
          // Place text vertically, starting at y=200 and incrementing by 30
          return `<text x="40" y="${200 + i * 30}" font-size="20" fill="#444444">${i + 1}. ${c.name}: $${gdpInTrillions}T</text>`;
      })
      .join('');

  // Format the timestamp for clean display
  const formattedTimestamp = new Date(lastRefreshedAt).toLocaleString();

  // 3. Complete SVG Template (based on your structure)
  const svgTemplate = `
      <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
          <!-- Background and Title -->
          <rect width="100%" height="100%" fill="#e0f7fa"/>
          <text x="300" y="50" font-size="30" font-weight="bold" fill="#00796b" text-anchor="middle">
              Global Economic Snapshot 🌍
          </text>

          <rect x="20" y="80" width="560" height="2" fill="#00796b"/>

          <!-- Total Countries Stat -->
          <text x="40" y="120" font-size="24" font-weight="bold" fill="#004d40">
              Total Countries: ${total}
          </text>

          <!-- Top 5 Section Header -->
          <text x="40" y="170" font-size="24" font-weight="bold" fill="#004d40">
              Top 5 Countries by Estimated GDP (Trillions USD):
          </text>

          <!-- Top 5 List -->
          ${topCountriesSVG}
          
          <!-- Footer -->
          <rect x="20" y="340" width="560" height="2" fill="#00796b"/>

          <text x="300" y="375" font-size="18" fill="#757575" text-anchor="middle">
              Last Refresh: ${formattedTimestamp}
          </text>
      </svg>
  `;

  // 4. Sharp Rendering
  try {
      await sharp(Buffer.from(svgTemplate))
          .resize(600, 400) // Match the SVG dimensions
          .toFormat('png')
          .toFile(outputPath);

      console.log(`✅ Image successfully generated and saved to: ${outputPath}`);
      return outputPath;
  } catch (error) {
      console.error('❌ Error generating image with sharp:', error);
      // It's crucial to ensure the process exits cleanly or logs the issue
      throw new Error(`Failed to generate summary image: ${error.message}`);
  }
};


module.exports = generateSummaryImage