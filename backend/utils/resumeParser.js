import fs from 'fs';
import pdfParse from 'pdf-parse';

export const extractTextFromPDF = async (filePath) => {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
};
