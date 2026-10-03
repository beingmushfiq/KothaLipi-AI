import { LinguisticAnalysis, ProofreadChange, Language } from '../types';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
} from 'docx';

/**
 * Downloads text as a clean UTF-8 text file with Byte Order Mark (BOM).
 * The BOM ensures Windows Notepad and other editors immediately recognize Bengali UTF-8 encoding.
 */
export function downloadAsTxt(filename: string, text: string): void {
  const blob = new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates formatted Markdown text with frontmatter, linguistic score, tables, and change log.
 */
export function generateMarkdownReport(
  title: string,
  polishedText: string,
  originalText?: string,
  analysis?: LinguisticAnalysis,
  changes?: ProofreadChange[],
  language: Language = 'en'
): string {
  const dateStr = new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const wordCount = polishedText.trim() ? polishedText.trim().split(/\s+/).length : 0;
  const charCount = polishedText.length;

  let md = `---
title: "${title.replace(/"/g, '\\"')}"
date: "${dateStr}"
toolkit: "Bangla AI Studio"
words: ${wordCount}
characters: ${charCount}
${analysis ? `readability_score: ${analysis.readabilityScore}\ntone: "${analysis.tone}"\nstyle: "${analysis.style}"` : ''}
---

# ${title}

> **Bangla AI Toolkit — Language & Orthography Report**  
> *${language === 'bn' ? 'সংরক্ষণ তারিখ:' : 'Generated on:'} ${dateStr}* · *${wordCount} ${language === 'bn' ? 'শব্দ' : 'words'}*

`;

  if (analysis) {
    md += `## ${language === 'bn' ? 'ভাষারীতি ও শৈলী মূল্যায়ন' : 'Linguistic Assessment'}\n\n`;
    md += `- **${language === 'bn' ? 'গুণগত মান স্কোর:' : 'Readability Score:'}** ${analysis.readabilityScore}/100\n`;
    md += `- **${language === 'bn' ? 'টোন (Tone):' : 'Tone:'}** ${analysis.tone}\n`;
    md += `- **${language === 'bn' ? 'রীতিরূপ (Style):' : 'Style:'}** ${analysis.style}\n`;
    if (analysis.keyNotes) {
      md += `- **${language === 'bn' ? 'পরামর্শ ও সারসংক্ষেপ:' : 'Key Notes:'}** ${analysis.keyNotes}\n`;
    }
    md += `\n---\n\n`;
  }

  md += `## ${language === 'bn' ? 'পরিমার্জিত ও শুদ্ধ বাংলা পাঠ্য' : 'Polished Bengali Content'}\n\n`;
  md += `${polishedText}\n\n`;

  if (originalText && originalText !== polishedText) {
    md += `---\n\n## ${language === 'bn' ? 'মূল খসড়া' : 'Original Draft'}\n\n`;
    md += `${originalText}\n\n`;
  }

  if (changes && changes.length > 0) {
    md += `---\n\n## ${language === 'bn' ? `প্রযুক্ত ব্যাকরণ ও বানান বিধিসমূহ (${changes.length})` : `Applied Linguistic & Grammar Rules (${changes.length})`}\n\n`;
    md += `| ${language === 'bn' ? 'মূল রূপ (Original)' : 'Original'} | ${language === 'bn' ? 'সংশোধিত রূপ (Replacement)' : 'Replacement'} | ${language === 'bn' ? 'বিধি বিবরণী (Explanation)' : 'Grammar & Orthography Rule'} |\n`;
    md += `|---|---|---|\n`;
    changes.forEach((c) => {
      md += `| \`${c.original}\` | **${c.replacement}** | ${c.explanation} |\n`;
    });
    md += `\n`;
  }

  md += `---\n\n*${language === 'bn' ? 'বাংলা একাডেমি প্রমিত বানান নীতিমালা অনুযায়ী প্রক্রিয়াজাত' : 'Processed under Bangla Academy Standard Orthography Protocols'} — Bangla AI Toolkit*\n`;

  return md;
}

/**
 * Downloads a structured Markdown document with linguistic metadata and rule log.
 */
export function downloadAsMarkdown(
  filename: string,
  title: string,
  polishedText: string,
  originalText?: string,
  analysis?: LinguisticAnalysis,
  changes?: ProofreadChange[],
  language: Language = 'en'
): void {
  const md = generateMarkdownReport(title, polishedText, originalText, analysis, changes, language);
  const blob = new Blob(['\uFEFF' + md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.md') ? filename : `${filename}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a rich Word document (.docx) compatible with Microsoft Word and Google Docs.
 */
export async function downloadAsDocx(
  filename: string,
  title: string,
  polishedText: string,
  originalText?: string,
  analysis?: LinguisticAnalysis,
  changes?: ProofreadChange[],
  language: Language = 'en'
): Promise<void> {
  const dateStr = new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const fontConfig = {
    name: 'Hind Siliguri',
  };

  try {
    const docChildren: (Paragraph | Table)[] = [];

    // Header Title
    docChildren.push(
      new Paragraph({
        text: 'Bangla AI Toolkit',
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 80 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: language === 'bn'
              ? 'উন্নত বাংলা ভাষা ও বানান পরিমার্জন প্রটোকল'
              : 'Advanced Bengali Orthography & Linguistic Suite',
            color: '64748B',
            size: 20,
            font: fontConfig.name,
          }),
        ],
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `${language === 'bn' ? 'তারিখ:' : 'Date:'} ${dateStr}  |  ${language === 'bn' ? 'শব্দ সংখ্যা:' : 'Words:'} ${polishedText.trim().split(/\s+/).length}`,
            color: '475569',
            size: 20,
            font: fontConfig.name,
          }),
        ],
        spacing: { after: 300 },
      })
    );

    // Document Title
    docChildren.push(
      new Paragraph({
        text: title,
        heading: HeadingLevel.TITLE,
        spacing: { after: 240 },
      })
    );

    // Linguistic Score Card
    if (analysis) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${language === 'bn' ? 'গুণগত মান স্কোর:' : 'Quality Score:'} `,
              bold: true,
              size: 22,
              font: fontConfig.name,
            }),
            new TextRun({
              text: `${analysis.readabilityScore}/100`,
              bold: true,
              color: '0F766E',
              size: 24,
              font: fontConfig.name,
            }),
            new TextRun({
              text: `  ·  ${analysis.tone}  ·  ${analysis.style}`,
              color: '0F766E',
              size: 20,
              font: fontConfig.name,
            }),
          ],
          spacing: { after: 120 },
        })
      );

      if (analysis.keyNotes) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${language === 'bn' ? 'পরামর্শ ও মূল্যায়ন: ' : 'Linguistic Assessment: '}`,
                bold: true,
                size: 20,
                font: fontConfig.name,
              }),
              new TextRun({
                text: analysis.keyNotes,
                italics: true,
                color: '334155',
                size: 20,
                font: fontConfig.name,
              }),
            ],
            spacing: { after: 280 },
          })
        );
      }
    }

    // Polished Content Heading
    docChildren.push(
      new Paragraph({
        text: language === 'bn' ? 'পরিমার্জিত ও শুদ্ধ বাংলা পাঠ্য' : 'Polished Bengali Content',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 140 },
      })
    );

    // Polished Paragraphs
    const paragraphs = polishedText.split('\n');
    paragraphs.forEach((p) => {
      if (p.trim()) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: p,
                size: 24,
                font: fontConfig.name,
              }),
            ],
            spacing: { after: 140, line: 360 },
          })
        );
      }
    });

    // Original Draft if different
    if (originalText && originalText !== polishedText) {
      docChildren.push(
        new Paragraph({
          text: language === 'bn' ? 'মূল খসড়া' : 'Original Draft',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 140 },
        })
      );

      const origParas = originalText.split('\n');
      origParas.forEach((op) => {
        if (op.trim()) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: op,
                  color: '64748B',
                  size: 22,
                  font: fontConfig.name,
                }),
              ],
              spacing: { after: 120 },
            })
          );
        }
      });
    }

    // Rules Table if changes exist
    if (changes && changes.length > 0) {
      docChildren.push(
        new Paragraph({
          text: language === 'bn'
            ? `প্রযুক্ত ব্যাকরণ ও বানান বিধিসমূহ (${changes.length})`
            : `Applied Linguistic & Grammar Rules (${changes.length})`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 180 },
        })
      );

      const tableRows: TableRow[] = [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: language === 'bn' ? 'মূল রূপ' : 'Original Text',
                      bold: true,
                      size: 20,
                      font: fontConfig.name,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: language === 'bn' ? 'সংশোধিত রূপ' : 'Replacement',
                      bold: true,
                      size: 20,
                      font: fontConfig.name,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: language === 'bn' ? 'বিধি বিবরণী' : 'Rule Explanation',
                      bold: true,
                      size: 20,
                      font: fontConfig.name,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ];

      changes.forEach((c) => {
        tableRows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: c.original,
                        strike: true,
                        color: 'B91C1C',
                        size: 20,
                        font: fontConfig.name,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: c.replacement,
                        bold: true,
                        color: '0F766E',
                        size: 20,
                        font: fontConfig.name,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: c.explanation,
                        size: 19,
                        font: fontConfig.name,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
        );
      });

      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableRows,
        })
      );
    }

    // Footer note
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: language === 'bn'
              ? 'বাংলা একাডেমি প্রমিত বানান নীতিমালা অনুযায়ী প্রক্রিয়াজাত · Bangla AI Toolkit'
              : 'Processed under Bangla Academy Standard Orthography Guidelines · Bangla AI Toolkit',
            color: '94A3B8',
            size: 18,
            font: fontConfig.name,
          }),
        ],
        spacing: { before: 400 },
      })
    );

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docChildren,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Docx generation error, using HTML fallback:', error);
    // Graceful fallback to Word-compatible HTML format
    const htmlWord = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${title}</title>
      <style>body { font-family: 'Hind Siliguri', 'Vrinda', sans-serif; line-height: 1.6; padding: 20px; }</style>
      </head>
      <body>
        <h2>Bangla AI Toolkit</h2>
        <p style="color:#666">${dateStr}</p>
        <h1>${title}</h1>
        <h3>${language === 'bn' ? 'পরিমার্জিত রূপ' : 'Polished Text'}</h3>
        <p>${polishedText.replace(/\n/g, '<br/>')}</p>
      </body>
      </html>
    `;
    const fallbackBlob = new Blob(['\uFEFF' + htmlWord], { type: 'application/msword' });
    const fallbackUrl = URL.createObjectURL(fallbackBlob);
    const fallbackLink = document.createElement('a');
    fallbackLink.href = fallbackUrl;
    fallbackLink.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
    document.body.appendChild(fallbackLink);
    fallbackLink.click();
    document.body.removeChild(fallbackLink);
    URL.revokeObjectURL(fallbackUrl);
  }
}

/**
 * Generates an archival, print-ready document and invokes the browser print-to-PDF engine.
 * This guarantees 100% native Bengali ligature and font rendering without PDF library corruption.
 */
export function exportAsPdf(
  title: string,
  polishedText: string,
  originalText?: string,
  analysis?: LinguisticAnalysis,
  changes?: ProofreadChange[],
  language: Language = 'en'
): void {
  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) {
    alert(
      language === 'en'
        ? 'Please allow popups for this site to export PDF.'
        : 'পিডিএফ তৈরির জন্য অনুগ্রহ করে ব্রাউজারে পপ-আপের অনুমতি দিন।'
    );
    return;
  }

  const dateStr = new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const htmlContent = `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <title>${title} - Bangla AI Toolkit</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700&family=Tiro+Bangla&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 20mm 18mm 20mm 18mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Hind Siliguri', 'Tiro Bangla', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.7;
      font-size: 14px;
      padding: 30px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f766e;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 20px;
      font-weight: 700;
      color: #0f766e;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .meta-box {
      text-align: right;
      font-size: 11px;
      color: #475569;
    }
    .doc-title {
      font-size: 20px;
      font-weight: 700;
      color: #090d16;
      margin-bottom: 16px;
    }
    .score-badge {
      display: inline-block;
      background: #f0fdfa;
      border: 1px solid #99f6e4;
      color: #0f766e;
      font-weight: 600;
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 6px;
      margin-bottom: 16px;
    }
    .content-box {
      background: #fafaf9;
      border: 1px solid #e7e5e4;
      border-radius: 8px;
      padding: 20px;
      font-size: 15px;
      line-height: 1.8;
      white-space: pre-wrap;
      color: #1c1917;
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f766e;
      margin-bottom: 10px;
      margin-top: 20px;
    }
    .changes-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-top: 10px;
    }
    .changes-table th {
      background: #f1f5f9;
      color: #334155;
      text-align: left;
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
      font-weight: 600;
    }
    .changes-table td {
      padding: 8px 10px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
    }
    .strikethrough {
      text-decoration: line-through;
      color: #b91c1c;
      background: #fef2f2;
      padding: 1px 4px;
      border-radius: 3px;
    }
    .replacement {
      color: #0f766e;
      font-weight: 600;
      background: #f0fdfa;
      padding: 1px 4px;
      border-radius: 3px;
    }
    .footer {
      margin-top: 36px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #94a3b8;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-title">Bangla AI Toolkit</div>
      <div class="brand-sub">${language === 'bn' ? 'উন্নত বাংলা ভাষা ও বানান পরিমার্জন প্রটোকল' : 'Advanced Bengali Orthography & Linguistic Suite'}</div>
    </div>
    <div class="meta-box">
      <div><strong>${language === 'bn' ? 'তারিখ:' : 'Date:'}</strong> ${dateStr}</div>
      <div><strong>${language === 'bn' ? 'শব্দ সংখ্যা:' : 'Words:'}</strong> ${polishedText.trim().split(/\s+/).length}</div>
    </div>
  </div>

  <div class="doc-title">${title}</div>

  ${
    analysis
      ? `
    <div class="score-badge">
      ${language === 'bn' ? 'গুণগত মান স্কোর:' : 'Quality Score:'} <strong>${analysis.readabilityScore}/100</strong>
      ${analysis.tone ? ` &bull; ${analysis.tone}` : ''}
    </div>
  `
      : ''
  }

  <div class="section-title">${language === 'bn' ? 'পরিমার্জিত ও শুদ্ধ বাংলা পাঠ্য' : 'Polished & Standardized Bengali Content'}</div>
  <div class="content-box">${polishedText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>

  ${
    changes && changes.length > 0
      ? `
    <div class="section-title">${language === 'bn' ? `প্রযুক্ত ব্যাকরণ ও বানান বিধিসমূহ (${changes.length})` : `Applied Linguistic & Grammar Rules (${changes.length})`}</div>
    <table class="changes-table">
      <thead>
        <tr>
          <th style="width: 25%">${language === 'bn' ? 'মূল রূপ' : 'Original Text'}</th>
          <th style="width: 25%">${language === 'bn' ? 'সংশোধিত রূপ' : 'Replacement'}</th>
          <th style="width: 50%">${language === 'bn' ? 'বিধি বিবরণী' : 'Grammar & Orthography Explanation'}</th>
        </tr>
      </thead>
      <tbody>
        ${changes
          .map(
            (c) => `
          <tr>
            <td><span class="strikethrough">${c.original}</span></td>
            <td><span class="replacement">${c.replacement}</span></td>
            <td>${c.explanation}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `
      : ''
  }

  <div class="footer">
    <div>${language === 'bn' ? 'বাংলা একাডেমি প্রমিত বানান নীতিমালা অনুযায়ী প্রক্রিয়াজাত' : 'Processed under Bangla Academy Standard Orthography Guidelines'}</div>
    <div>Bangla AI &bull; ${dateStr}</div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
