export interface CertificateInfo {
    participantName: string;
    participantCertNumber?: string;
    courseTitle: string;
    issueDate: string;
    hours: number;
    ethicsHours?: number;
    supervisionHours?: number;
    instructor: string;
    providerName: string;
    providerId: string;
    aceCoordinator: string;
    aceOrganizationName?: string;
    aceProviderType?: 'Organization' | 'Individual';
    modality?: string;
    signatureUrl?: string;
    calabaLogoUrl?: string;
}

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

const SIGNATURE_FONT_URL = '/fonts/AlexBrush-Regular.ttf';

let signatureFontBytesPromise: Promise<Uint8Array | null> | null = null;

const loadSignatureFontBytes = async (): Promise<Uint8Array | null> => {
    if (signatureFontBytesPromise) return signatureFontBytesPromise;
    signatureFontBytesPromise = (async () => {
        if (typeof window === 'undefined' || typeof fetch === 'undefined') return null;
        try {
            const response = await fetch(SIGNATURE_FONT_URL);
            if (!response.ok) return null;
            const buffer = await response.arrayBuffer();
            return new Uint8Array(buffer);
        } catch (error) {
            console.warn('Failed to load signature font.', error);
            return null;
        }
    })();
    return signatureFontBytesPromise;
};

const decodeBase64DataUrl = (dataUrl: string): Uint8Array | null => {
    const parts = dataUrl.split(',');
    if (parts.length < 2) return null;
    try {
        const base64 = parts[1];
        const binary = atob(base64);
        return Uint8Array.from(binary, c => c.charCodeAt(0));
    } catch {
        return null;
    }
};

const fetchBytesFromUrl = async (url: string): Promise<Uint8Array | null> => {
    if (typeof fetch === 'undefined') return null;
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const buffer = await response.arrayBuffer();
        return new Uint8Array(buffer);
    } catch {
        return null;
    }
};

const loadImageBytes = async (source?: string): Promise<Uint8Array | null> => {
    if (!source) return null;
    if (source.startsWith('data:')) {
        return decodeBase64DataUrl(source);
    }
    if (source.startsWith('http')) {
        return fetchBytesFromUrl(source);
    }
    return null;
};

const embedSignatureImage = async (pdfDoc: PDFDocument, bytes: Uint8Array) => {
    try {
        return await pdfDoc.embedPng(bytes);
    } catch {
        try {
            return await pdfDoc.embedJpg(bytes);
        } catch {
            return null;
        }
    }
};

export const generateCertificatePDF = async (cert: CertificateInfo): Promise<Uint8Array> => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([792, 612]); // Letter Landscape
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const signatureFontBytes = await loadSignatureFontBytes();
    if (signatureFontBytes) {
        pdfDoc.registerFontkit(fontkit);
    }
    const signatureFont = signatureFontBytes ? await pdfDoc.embedFont(signatureFontBytes) : regularFont;

    const drawField = (x: number, y: number, w: number, label: string, value: string | number | undefined, fontSize = 12, labelSize = 7) => {
        const labelWidth = regularFont.widthOfTextAtSize(label, labelSize);
        page.drawText(label, {
            x: x + (w - labelWidth) / 2,
            y: y - 10,
            size: labelSize,
            font: regularFont,
            color: rgb(0.3, 0.3, 0.3),
        });
        if (value !== undefined) {
            const valStr = String(value);
            const valWidth = font.widthOfTextAtSize(valStr, fontSize);
            page.drawText(valStr, {
                x: x + (w - valWidth) / 2,
                y: y + 6,
                size: fontSize,
                font,
                color: rgb(0, 0, 0),
            });
        }
    };

    const drawSectionHeader = (y: number, text: string) => {
        const textWidth = font.widthOfTextAtSize(text, 18);
        page.drawText(text, {
            x: (width - textWidth) / 2,
            y,
            size: 18,
            font,
            color: rgb(0, 0, 0),
        });
    };

    page.drawText("Learning Continuing Education", {
        x: (width - font.widthOfTextAtSize("Learning Continuing Education", 24)) / 2,
        y: height - 60,
        size: 24,
        font,
    });

    const isOrg = cert.aceProviderType === 'Organization' || !!cert.aceOrganizationName;
    const providerTypeText = isOrg ? "Organization Provider" : "Individual Provider";
    page.drawText(providerTypeText, {
        x: width - 150,
        y: height - 60,
        size: 10,
        font,
        color: rgb(0, 0.4, 0.6),
    });

    drawField(80, height - 120, 300, "Participant Name", cert.participantName, 16);
    drawField(412, height - 120, 300, "Participant BACB Certification Number", cert.participantCertNumber || "N/A", 16);

    drawSectionHeader(height - 180, "Event Information");
    drawField(80, height - 230, 632, "Event Name", cert.courseTitle, 14);
    drawField(80, height - 280, 300, "Event Date", cert.issueDate);
    drawField(412, height - 280, 300, "Event Modality", cert.modality || "Online Synchronous");

    drawField(80, height - 330, 200, "Total Number of CEUs", cert.hours);
    drawField(296, height - 330, 200, "Number of CEUs in Ethics", cert.ethicsHours || 0);
    drawField(512, height - 330, 200, "Number of CEUs in Supervision", cert.supervisionHours || 0);

    const signatureName = cert.aceCoordinator || cert.providerName || cert.instructor || '';

    if (isOrg) {
        drawSectionHeader(height - 400, "ACE Coordinator Information");
        drawField(296, height - 440, 200, "ACE Coordinator Name", cert.aceCoordinator);

        drawSectionHeader(height - 500, "ACE Provider Information");
        drawField(80, height - 540, 200, "ACE Provider Name", cert.providerName);
        drawField(296, height - 540, 200, "ACE Provider Number", cert.providerId);
        drawField(512, height - 540, 200, "Instructor Name (if applicable)", cert.instructor);

        let signatureRendered = false;
        if (cert.signatureUrl) {
            const sigBytes = await loadImageBytes(cert.signatureUrl);
            const sigImage = sigBytes ? await embedSignatureImage(pdfDoc, sigBytes) : null;
            if (sigImage) {
                const sigDims = sigImage.scale(0.3);
                page.drawImage(sigImage, {
                    x: 80 + (250 - sigDims.width) / 2,
                    y: height - 590,
                    width: sigDims.width,
                    height: sigDims.height,
                });
                signatureRendered = true;
            }
        }
        if (!signatureRendered && signatureName) {
            const sWidth = signatureFont.widthOfTextAtSize(signatureName, 20);
            page.drawText(signatureName, { x: 80 + (250 - sWidth) / 2, y: height - 580, size: 20, font: signatureFont });
        }
        drawField(80, height - 590, 300, "ACE Provider Signature", "");
        drawField(480, height - 590, 232, "Date", cert.issueDate);
    } else {
        drawSectionHeader(height - 420, "Individual ACE Provider Information");
        drawField(80, height - 470, 200, "ACE Provider Name", cert.providerName);
        drawField(296, height - 470, 200, "ACE Provider Number", cert.providerId);
        drawField(512, height - 470, 200, "Business Name (if applicable)", cert.aceOrganizationName || "");

        let signatureRendered = false;
        if (cert.signatureUrl) {
            const sigBytes = await loadImageBytes(cert.signatureUrl);
            const sigImage = sigBytes ? await embedSignatureImage(pdfDoc, sigBytes) : null;
            if (sigImage) {
                const sigDims = sigImage.scale(0.3);
                page.drawImage(sigImage, {
                    x: 80 + (300 - sigDims.width) / 2,
                    y: height - 540,
                    width: sigDims.width,
                    height: sigDims.height,
                });
                signatureRendered = true;
            }
        }
        if (!signatureRendered && signatureName) {
            const sWidth = signatureFont.widthOfTextAtSize(signatureName, 20);
            page.drawText(signatureName, { x: 80 + (300 - sWidth) / 2, y: height - 530, size: 20, font: signatureFont });
        }
        drawField(80, height - 540, 400, "ACE Provider Signature", "");
        drawField(512, height - 540, 200, "Date", cert.issueDate);
    }

    const verificationHash = btoa(`${cert.participantName}-${cert.courseTitle}-${cert.issueDate}`).slice(0, 16).toUpperCase();
    page.drawText(`Verification ID: ${verificationHash}`, {
        x: width / 2 - 80,
        y: 10,
        size: 8,
        font: regularFont,
        color: rgb(0.6, 0.6, 0.6),
    });

    return await pdfDoc.save();
};
