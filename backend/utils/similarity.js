import { TfIdf } from 'natural';
import { cosineSimilarity } from 'simple-statistics';

export const getSimilarityScore = (resumeText, jobDescription) => {
    const tfidf = new TfIdf();
    tfidf.addDocument(resumeText);
    tfidf.addDocument(jobDescription);

    const resumeVector = [];
    const jobVector = [];

    tfidf.listTerms(0).forEach(term => resumeVector.push(term.tfidf));
    tfidf.listTerms(1).forEach(term => jobVector.push(term.tfidf));

    return cosineSimilarity(resumeVector, jobVector);
};
