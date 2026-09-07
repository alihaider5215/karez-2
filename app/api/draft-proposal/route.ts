import { NextRequest, NextResponse } from 'next/server';
import { generateWithProviders } from '../../../lib/ai_provider';

export const maxDuration = 90;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenderData, bidderProfile } = body;

    if (!tenderData || !bidderProfile) {
      return NextResponse.json(
        { error: 'tenderData and bidderProfile are required.' },
        { status: 400 }
      );
    }

    const companyName =
      (bidderProfile as any)?.companyName ||
      (bidderProfile as any)?.name ||
      'The Company';

    const pecCategory =
      (bidderProfile as any)?.pecCategory ||
      (bidderProfile as any)?.pecRegistrationCategory ||
      'Not specified';

    const ntn =
      (bidderProfile as any)?.ntnNumber ||
      (bidderProfile as any)?.ntn ||
      '[INSERT: NTN Number]';

    const turnoverRaw =
      (bidderProfile as any)?.avgAnnualTurnoverPKR ||
      (bidderProfile as any)?.threeYearAvgTurnover || 0;

    const turnoverFormatted =
      turnoverRaw >= 1_000_000_000
        ? `PKR ${(turnoverRaw / 1_000_000_000).toFixed(2)} Billion (${turnoverRaw.toLocaleString()} PKR)`
        : turnoverRaw >= 1_000_000
        ? `PKR ${(turnoverRaw / 1_000_000).toFixed(2)} Million (${turnoverRaw.toLocaleString()} PKR)`
        : `PKR ${turnoverRaw.toLocaleString()}`;

    const tenderTitle =
      tenderData?.basicInfo?.tenderTitle || 'Government Tender';
    const agency =
      tenderData?.basicInfo?.procuringAgency || 'Procuring Agency';
    const tenderId =
      tenderData?.basicInfo?.tenderId || 'N/A';
    const requiredPec =
      tenderData?.pecRequirement?.requiredCategory || 'Not stated';
    const requiredTurnover =
      tenderData?.financialCriteria?.minAvgAnnualTurnoverPKR;
    const requiredTurnoverStr = requiredTurnover
      ? requiredTurnover >= 1_000_000_000
        ? `PKR ${(requiredTurnover / 1_000_000_000).toFixed(2)} Billion`
        : `PKR ${(requiredTurnover / 1_000_000).toFixed(2)} Million`
      : 'Not stated';
    const cdrAmount =
      tenderData?.financialCriteria?.cdrAmountPKR;
    const cdrStr = cdrAmount
      ? cdrAmount >= 1_000_000
        ? `PKR ${(cdrAmount / 1_000_000).toFixed(2)} Million`
        : `PKR ${cdrAmount.toLocaleString()}`
      : 'as specified in tender';

    const prompt = `You are a Pakistani PPRA procurement proposal writer.
Return ONLY valid JSON. No markdown. No backticks. No explanation.

STRICT RULES:
- Use the EXACT company name: "${companyName}"
- Use EXACT values from the inputs below. Never invent facts.
- For unknown fields (year established, office address, past project names, 
  personnel names, annexure numbers), write [INSERT: description] as placeholder.
- Write formal Pakistani government procurement English throughout.
- Each section content must be 2 short paragraphs.
- Server-formatted numbers must appear EXACTLY as given. Do not reformat.

KNOWN INPUTS:
Company Name: ${companyName}
PEC Category: ${pecCategory}
NTN: ${ntn}
3-Year Average Turnover: ${turnoverFormatted}
Tender Title: ${tenderTitle}
Procuring Agency: ${agency}
Tender Reference: ${tenderId}
Required PEC Category: ${requiredPec}
Required Turnover: ${requiredTurnoverStr}
CDR Required: ${cdrStr}

Return this JSON:
{
  "proposalTitle": "Technical Proposal for ${tenderTitle}",
  "preparedFor": "${agency}",
  "preparedBy": "${companyName}",
  "tenderReference": "${tenderId}",
  "sections": [
    {
      "id": "section-1",
      "sectionNumber": "1.0",
      "title": "Company Profile & Introduction",
      "content": "2 paragraphs: introduce ${companyName}, mention PEC ${pecCategory}, NTN ${ntn}, year established [INSERT: Year], SECP registration, and general construction expertise.",
      "isRequired": true,
      "pageEstimate": 2
    },
    {
      "id": "section-2",
      "sectionNumber": "2.0",
      "title": "Technical Capability & PEC Licensing",
      "content": "2 paragraphs: describe PEC ${pecCategory} license and how it meets or exceeds the ${requiredPec} requirement for this tender. Mention specialization codes if known.",
      "isRequired": true,
      "pageEstimate": 2
    },
    {
      "id": "section-3",
      "sectionNumber": "3.0",
      "title": "Relevant Experience & Past Performance",
      "content": "2 paragraphs: describe past infrastructure experience. Use [INSERT: Project Name, Client, Value, Completion Date] for specific project references. Mention 7-year experience window per tender rules.",
      "isRequired": true,
      "pageEstimate": 3
    },
    {
      "id": "section-4",
      "sectionNumber": "4.0",
      "title": "Key Personnel & Organisation",
      "content": "2 paragraphs: describe team structure. Use [INSERT: Name, Qualification, Experience] for specific personnel. Mention PEC-registered engineers and HSE officers.",
      "isRequired": true,
      "pageEstimate": 2
    },
    {
      "id": "section-5",
      "sectionNumber": "5.0",
      "title": "Methodology & Work Plan",
      "content": "2 paragraphs: describe construction methodology specific to this project type. Reference Primavera P6 scheduling, AASHTO/NHA standards, phased execution. Use [INSERT: Gantt Chart Annexure] for timeline reference.",
      "isRequired": true,
      "pageEstimate": 3
    },
    {
      "id": "section-6",
      "sectionNumber": "6.0",
      "title": "Financial Capacity & CDR",
      "content": "2 paragraphs: state that ${companyName} has a 3-year average annual construction turnover of ${turnoverFormatted}, which meets the required ${requiredTurnoverStr}. Confirm CDR of ${cdrStr} will be enclosed. Do not invent or change any numbers.",
      "isRequired": true,
      "pageEstimate": 2
    }
  ],
  "documentChecklist": [
    {
      "id": "doc-1",
      "documentName": "PEC Registration Certificate",
      "description": "Valid PEC certificate in ${pecCategory} category, renewed for current financial year FY 2026-27",
      "stampPaperRequired": false,
      "stampPaperDenomination": null,
      "isOriginalRequired": true,
      "copiesRequired": 3,
      "urgencyLevel": "critical",
      "source": "Pakistan Engineering Council (PEC)"
    },
    {
      "id": "doc-2",
      "documentName": "Call Deposit Receipt (CDR) / Bid Security",
      "description": "CDR of ${cdrStr} from a scheduled bank in Pakistan (AA or above rating) in favor of ${agency}",
      "stampPaperRequired": false,
      "stampPaperDenomination": null,
      "isOriginalRequired": true,
      "copiesRequired": 1,
      "urgencyLevel": "critical",
      "source": "Your scheduled bank (AA or above rating)"
    },
    {
      "id": "doc-3",
      "documentName": "Non-Blacklisting Affidavit",
      "description": "Sworn affidavit on Rs. 500 judicial stamp paper declaring ${companyName} is not blacklisted by any government department or public sector organization",
      "stampPaperRequired": true,
      "stampPaperDenomination": 500,
      "isOriginalRequired": true,
      "copiesRequired": 3,
      "urgencyLevel": "critical",
      "source": "Notary Public / Oath Commissioner"
    },
    {
      "id": "doc-4",
      "documentName": "FBR NTN Certificate & ATL Verification",
      "description": "NTN certificate (NTN: ${ntn}) and Active Taxpayer List screenshot from FBR portal confirming active taxpayer status",
      "stampPaperRequired": false,
      "stampPaperDenomination": null,
      "isOriginalRequired": false,
      "copiesRequired": 3,
      "urgencyLevel": "critical",
      "source": "Federal Board of Revenue portal (fbr.gov.pk)"
    },
    {
      "id": "doc-5",
      "documentName": "Audited Financial Statements (3 Years)",
      "description": "Audited balance sheets and profit & loss statements for last 3 financial years, certified by ICAP-registered auditor, showing average annual turnover of ${turnoverFormatted}",
      "stampPaperRequired": false,
      "stampPaperDenomination": null,
      "isOriginalRequired": false,
      "copiesRequired": 3,
      "urgencyLevel": "critical",
      "source": "Your external auditor (ICAP registered)"
    },
    {
      "id": "doc-6",
      "documentName": "SECP Company Registration Certificate",
      "description": "Certificate of incorporation or Form-C from SECP confirming legal status and ownership structure of ${companyName}",
      "stampPaperRequired": false,
      "stampPaperDenomination": null,
      "isOriginalRequired": false,
      "copiesRequired": 3,
      "urgencyLevel": "important",
      "source": "Securities and Exchange Commission of Pakistan (SECP)"
    },
    {
      "id": "doc-7",
      "documentName": "Similar Project Experience Certificates",
      "description": "Completion certificates from clients for similar infrastructure/construction projects completed within the last 7 years, each showing project value, scope, and duration",
      "stampPaperRequired": false,
      "stampPaperDenomination": null,
      "isOriginalRequired": false,
      "copiesRequired": 3,
      "urgencyLevel": "critical",
      "source": "Previous project clients / employer organizations"
    },
    {
      "id": "doc-8",
      "documentName": "Bank Solvency / Credit Line Certificate",
      "description": "Letter from scheduled bank confirming available credit facility and liquid assets meeting the cash flow / working capital requirement of this tender",
      "stampPaperRequired": false,
      "stampPaperDenomination": null,
      "isOriginalRequired": true,
      "copiesRequired": 3,
      "urgencyLevel": "important",
      "source": "Your scheduled bank"
    },
    {
      "id": "doc-9",
      "documentName": "Power of Attorney / Authorization Letter",
      "description": "Notarized power of attorney authorizing the signatory to submit bids and sign documents on behalf of ${companyName}",
      "stampPaperRequired": true,
      "stampPaperDenomination": 500,
      "isOriginalRequired": true,
      "copiesRequired": 2,
      "urgencyLevel": "important",
      "source": "Notary Public / Oath Commissioner"
    },
    {
      "id": "doc-10",
      "documentName": "Tender Document Purchase Receipt",
      "description": "Proof of purchase of the official tender document from the procuring agency, if required by the tender notice",
      "stampPaperRequired": false,
      "stampPaperDenomination": null,
      "isOriginalRequired": false,
      "copiesRequired": 1,
      "urgencyLevel": "standard",
      "source": "${agency} procurement office"
    }
  ],
  "coverLetterDraft": "To,\\nThe [INSERT: Designation of Head of Procurement],\\n${agency},\\n[INSERT: Agency Address],\\nIslamabad / [INSERT: City].\\n\\nSubject: Technical Proposal for ${tenderTitle} (Ref: ${tenderId})\\n\\nDear Sir/Madam,\\n\\n${companyName}, holding NTN ${ntn} and PEC Category ${pecCategory}, hereby submits this Technical Proposal in response to your Invitation for Tenders for ${tenderTitle}. Our firm fully meets all eligibility criteria specified under PPRA Rules 2004 and the Tender Documents.\\n\\nWe have enclosed the required Call Deposit Receipt of ${cdrStr} and all supporting documents as required. We look forward to the opportunity to serve ${agency} on this important national project.\\n\\nYours faithfully,\\n\\n___________________________\\n[INSERT: Authorized Signatory Name]\\n[INSERT: Designation]\\n${companyName}\\nDate: [INSERT: Date of Submission]"
}`;

    const result = await generateWithProviders({
      parts: [{ text: prompt }],
      timeoutMs: 80000,
    });

    const proposalData = JSON.parse(result.text);
    return NextResponse.json({ proposalData, provider: result.provider, model: result.model });

  } catch (err: any) {
    console.error('Draft proposal error:', err);
    return NextResponse.json(
      { error: err?.message || 'Proposal generation failed.' },
      { status: 500 }
    );
  }
}
