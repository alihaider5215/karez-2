import { NextRequest, NextResponse } from 'next/server';
import { generateWithProviders } from '../../../lib/ai_provider';

export const maxDuration = 90;

const EXTRACTION_PROMPT = `You are Karez 2.0, a specialist AI for Pakistani government procurement under
PPRA Rules 2004. Extract EXACT numerical and legal values from tender documents.

CRITICAL RULES:
- NEVER guess or estimate. If a value is not explicitly stated, return null.
- Extract exact PKR amounts as integers without commas or currency symbols.
- Convert Million/Billion wording (e.g. "Rs. 2 Billion" = 2000000000).
- For PEC categories, only use: C-A, C-B, C-1, C-2, C-3, C-4, C-5, C-6
- CDR, Bid Security, and Earnest Money are the same field.
- Record the page number where each value was found.
- Assign confidenceScore 0-100 (below 85 for faded or smudged text).

Return ONLY this JSON with no other text:

{
  "basicInfo": {
    "tenderId": "string or null",
    "tenderTitle": "full project name as written, or null",
    "procuringAgency": "exact agency name, or null",
    "biddingType": "procedure as written, or null",
    "submissionDeadline": "date as written or null",
    "estimatedCostPKR": integer or null,
    "location": "city and province, or null",
    "ppraRuleReference": "rule number if mentioned, or null",
    "sourcePage": page number
  },
  "pecRequirement": {
    "requiredCategory": "C-A|C-B|C-1|C-2|C-3|C-4|C-5|C-6 or null",
    "specializationCodes": [],
    "validityRequirement": "string or null",
    "sourcePage": page number or null,
    "clauseText": "exact sentence from document or null",
    "confidenceScore": 0-100
  },
  "financialCriteria": {
    "minAvgAnnualTurnoverPKR": integer or null,
    "minNetWorthPKR": integer or null,
    "minLiquidAssetsWorkingCapitalPKR": integer or null,
    "cdrAmountPKR": integer or null,
    "cdrPercentage": number or null,
    "acceptableBankRating": "string or null",
    "sourcePage": page number or null,
    "clauseText": "exact sentence or null",
    "confidenceScore": 0-100
  },
  "technicalCriteria": {
    "minSimilarProjectsPKR": integer or null,
    "minYearsExperience": integer or null,
    "requiredEquipment": [],
    "requiredKeyPersonnel": [],
    "sourcePage": page number or null
  },
  "legalRequirements": {
    "requiredAffidavits": [],
    "stampPaperDenomination": integer or null,
    "jvAllowed": true or false,
    "jvLeadPartnerMinShare": number or null,
    "blacklistingClause": true or false,
    "sourcePage": page number or null
  }
}`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const pagesJson = formData.get('pages') as string | null;

    if (!file && !pagesJson) {
      return NextResponse.json({ error: 'No file or pages provided.' }, { status: 400 });
    }

    let parts: any[] = [];

    if (pagesJson) {
      const pages: string[] = JSON.parse(pagesJson);
      parts = pages.map((dataUrl: string) => {
        const base64 = dataUrl.split(',')[1];
        return { inlineData: { mimeType: 'image/jpeg', data: base64 } };
      });
    } else if (file) {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      parts = [{ inlineData: { mimeType: file.type || 'application/pdf', data: base64 } }];
    }

    parts.push({ text: EXTRACTION_PROMPT });

    const result = await generateWithProviders({
      parts,
      timeoutMs: 75000,
    });

    const extractedData = JSON.parse(result.text);
    return NextResponse.json({
      extractedData,
      provider: result.provider,
      model: result.model,
      isFallback: false,
    });

  } catch (err: any) {
    console.error('Analyze tender error:', err);
    return NextResponse.json(
      { error: err?.message || 'Analysis failed.' },
      { status: 500 }
    );
  }
}
