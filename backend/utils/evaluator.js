import natural from 'natural';
const tokenizer = new natural.WordTokenizer();

export const evaluateResume = (resumeText, jobDescription) => {
    const resumeTokens = new Set(tokenizer.tokenize(resumeText.toLowerCase()));
    const jobTokens = new Set(tokenizer.tokenize(jobDescription.toLowerCase()));
    
    const matchedTokens = [...resumeTokens].filter(token => jobTokens.has(token));
    const score = (matchedTokens.length / jobTokens.size) * 100;
    return score.toFixed(2);
};
