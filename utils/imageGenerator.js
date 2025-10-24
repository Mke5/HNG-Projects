import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import moment from 'moment';

export const generateSummaryImage = async (countries, lastRefreshedAt) => {
  const outputPath = path.join('cache', 'summary.png');

  const total = countries.length;
  const top5 = [...countries]
    .filter(c => c.estimated_gdp)
    .sort((a, b) => b.estimated_gdp - a.estimated_gdp)
    .slice(0, 5);

  let text = `🌍 Country Summary\n\nTotal Countries: ${total}\nLast Refreshed: ${moment(lastRefreshedAt).utc().format()}\n\nTop 5 GDP:\n`;
  top5.forEach((c, i) => {
    text += `${i + 1}. ${c.name} — ${c.estimated_gdp.toFixed(2)}\n`;
  });

  await sharp({
    create: {
      width: 800,
      height: 400,
      channels: 3,
      background: '#1e1e1e'
    }
  })
    .composite([
      {
        input: Buffer.from(
          `<svg width="800" height="400">
            <text x="20" y="50" font-size="24" fill="white">${text.replace(/\n/g, '&#10;')}</text>
          </svg>`
        ),
        top: 0,
        left: 0
      }
    ])
    .png()
    .toFile(outputPath);

  return outputPath;
};
