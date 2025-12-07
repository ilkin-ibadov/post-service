export function extractMentions(content: string): string[] {
    const regex = /@([a-zA-Z0-9_]+)/g;
    const matches: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
        matches.push(match[1]); // username only
    }

    return matches;
}
