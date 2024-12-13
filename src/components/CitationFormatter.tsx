"use client"

import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { parse as parseYaml } from 'yaml';
import JsonLd from './JsonLd';

interface Citation {
    title?: string;
    author?: string[];
    year?: string;
    journal?: string;
    volume?: string;
    number?: string;
    pages?: string;
    publisher?: string;
    [key: string]: string | string[] | undefined;
}

const CitationFormatter = () => {
    const [input, setInput] = useState('');
    const [style, setStyle] = useState('ieee');
    const [output, setOutput] = useState('');

    const citationStyles = [
        { id: 'ieee', name: 'IEEE' },
        { id: 'apa', name: 'APA' },
        { id: 'chicago-author-date', name: 'Chicago (Author-Date)' },  // 科学論文向け
        { id: 'mla', name: 'MLA' },
        { id: 'chicago-notes', name: 'Chicago (Notes)' },             // 人文科学向け
        { id: 'harvard-cite-them-right', name: 'Harvard' },
        { id: 'american-physics-society', name: 'American Physics Society' },
    ];

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setInput(text);
                formatCitation(text, style);
            };
            reader.readAsText(file);
        }
    };

    const parseBibTeX = (text: string): Citation[] => {
        const citations: Citation[] = [];
        const entries = text.split(/\n@|\r\n@/);

        for (const entry of entries) {
            if (!entry.trim()) continue;

            const citation: Citation = {};

            // エントリーの種類とキーを抽出
            const typeMatch = entry.match(/^(?:@)?(\w+)\s*{\s*([^,]+)/);
            if (!typeMatch) continue;

            const [, type, key] = typeMatch;
            citation['type'] = type;
            citation['key'] = key;

            // 年の抽出を改善
            const yearMatch = entry.match(/year\s*=\s*[{"']?(\d{4})[}"']?\s*,?/);
            if (yearMatch) {
                citation['year'] = yearMatch[1];
            }

            // フィールドのマッチングを改善
            let currentField = '';
            let currentValue = '';
            const lines = entry.split(/\r?\n/);

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                // 新しいフィールドの開始を検出
                const fieldStartMatch = line.match(/^\s*(\w+)\s*=\s*[{"]/);

                if (fieldStartMatch) {
                    // 前のフィールドを保存
                    if (currentField && currentValue) {
                        processField(citation, currentField, currentValue);
                    }

                    currentField = fieldStartMatch[1].toLowerCase();
                    // フィールドの開始位置を取得
                    const valueStart = line.indexOf('=') + 1;
                    currentValue = line.slice(valueStart).trim();
                } else if (currentField && line) {
                    // 現在のフィールドの値を追加
                    currentValue += ' ' + line;
                }

                // フィールドの終了を検出
                if (currentValue.match(/[}"],\s*$/)) {
                    currentValue = currentValue
                        .replace(/[}"],\s*$/, '')  // 終端の記号を除去
                        .replace(/^\s*[{"]\s*/, '')  // 先頭の記号を除去
                        .trim();
                    processField(citation, currentField, currentValue);
                    currentField = '';
                    currentValue = '';
                }
            }

            // 最後のフィールドを処理
            if (currentField && currentValue) {
                currentValue = currentValue
                    .replace(/[}"],\s*$/, '')
                    .replace(/^\s*[{"]\s*/, '')
                    .trim();
                processField(citation, currentField, currentValue);
            }

            if (Object.keys(citation).length > 2) {
                citations.push(citation);
            }
        }
        return citations;
    };

    const processField = (citation: Citation, field: string, value: string) => {
        // 値から余分な記号と空白を除去
        const cleanedValue = value
            .replace(/\s+/g, ' ')  // 連続する空白を1つに
            .replace(/}\s*{/g, '')  // 連続する中括弧を除去
            .replace(/[{}]/g, '')   // 残りの中括弧を除去
            .trim();

        if (field === 'author') {
            const authors = cleanedValue
                .split(/\s+and\s+/)
                .map(author => author.trim())
                .filter(author => author);
            citation[field] = authors;
        } else {
            citation[field] = cleanedValue;
        }
    };

    const parseInput = (text: string): Citation[] => {
        try {
            if (text.trim().startsWith('@')) {
                return parseBibTeX(text);
            } else {
                return parseYaml(text);
            }
        } catch (e) {
            console.error('Parse error:', e);
            return [];
        }
    };

    const formatCitation = (text: string, selectedStyle: string) => {
        const citations = parseInput(text);
        let formattedText = '';

        if (citations.length === 0) {
            setOutput('No valid citations found. Please check your input format.');
            return;
        }

        switch (selectedStyle) {
            case 'ieee':
                formattedText = citations.map((citation, index) => {
                    const authors = citation.author?.length ?
                        citation.author.join(', ') :
                        'No author';
                    const title = citation.title || 'No title';
                    const journal = citation.journal || citation.booktitle || '';
                    const volume = citation.volume ? `, vol. ${citation.volume}` : '';
                    const number = citation.number ? `, no. ${citation.number}` : '';
                    const pages = citation.pages ? `, pp. ${citation.pages}` : '';
                    const year = citation.year ? `, ${citation.year}` : '';

                    return `[${index + 1}] ${authors}, "${title}"${journal ? `, ${journal}` : ''
                        }${volume}${number}${pages}${year}.`
                        .replace(/,\s*,/g, ',')
                        .replace(/\s+/g, ' ')
                        .replace(/\s+\./g, '.');
                }).join('\n');
                break;

            case 'apa':
                formattedText = citations.map(citation => {
                    const authors = citation.author?.join(', ') || 'No author';
                    const year = citation.year ? `(${citation.year})` : '';
                    const title = citation.title ? `${citation.title}` : '';
                    const journal = citation.journal || citation.booktitle || '';
                    const volume = citation.volume || '';
                    const number = citation.number ? `(${citation.number})` : '';
                    const pages = citation.pages || '';

                    const parts = [
                        authors,
                        year,
                        title ? `${title}.` : '',
                        journal ? `${journal}` : '',
                        volume && number ? `${volume}${number}` : volume || number,
                        pages ? pages : ''
                    ].filter(part => part); // 空の部分を除去

                    return parts.join(' ').replace(/\s+/g, ' ').trim() + '.';
                }).join('\n');
                break;

            case 'mla':
                formattedText = citations.map(citation => {
                    const authors = citation.author?.[0] || 'No author';
                    const title = citation.title ? `"${citation.title}"` : '"No title"';
                    const journal = citation.journal || citation.booktitle || '';
                    const volume = citation.volume || '';
                    const number = citation.number ? `.${citation.number}` : '';
                    const year = citation.year ? `(${citation.year})` : '';
                    const pages = citation.pages || '';

                    const parts = [
                        `${authors}.`,
                        title,
                        journal,
                        volume && number ? `${volume}${number}` : '',
                        year,
                        pages ? `: ${pages}` : ''
                    ].filter(part => part.length > 0);

                    return parts.join(' ')
                        .replace(/\s+/g, ' ')      // 連続する空白を1つに
                        .replace(/\s+\./g, '.')    // ピリオド前の空白を削除
                        .replace(/\.+/g, '.')      // 連続するピリオドを1つに
                        .replace(/\"\./g, '\"')    // 引用符の後のピリオドを削除
                        .trim() + '.';
                }).join('\n');
                break;

            case 'chicago-author-date':
                formattedText = citations.map(citation => {
                    const authors = citation.author?.length ?
                        citation.author.join(' and ') :
                        'No author';
                    const year = citation.year ? citation.year : '';
                    const title = citation.title || '[no title]';
                    const journal = citation.journal || citation.booktitle || '';
                    const pages = citation.pages || '';

                    const parts = [];
                    parts.push(`${authors}.`);
                    if (year) {
                        parts.push(`${year}.`);
                    }
                    parts.push(`"${title}."`);

                    if (journal) {
                        parts.push(journal);
                    }

                    if (pages) {
                        parts.push(`: ${pages}`);
                    }

                    return parts.join(' ')
                        .replace(/\s+/g, ' ')      // 連続する空白を1つに
                        .replace(/\s+\./g, '.')    // ピリオド前の空白を削除
                        .replace(/\.+/g, '.')      // 連続するピリオドを1つに
                        .replace(/\"\./g, '\"')    // 引用符の後のピリオドを削除
                        .trim();
                }).join('\n');
                break;

            case 'chicago-notes':
                formattedText = citations.map(citation => {
                    const authors = citation.author?.length ?
                        citation.author.map(author => {
                            const names = author.split(' ');
                            const lastName = names[0];
                            const firstNames = names.slice(1).join(' ');
                            return firstNames ? `${lastName}, ${firstNames}` : lastName;
                        }).join(', ') :
                        'No author';
                    const year = citation.year ? citation.year : '';
                    const title = citation.title || '[no title]';
                    const journal = citation.journal || citation.booktitle || '';
                    const volume = citation.volume || '';
                    const number = citation.number ? `, no. ${citation.number}` : '';
                    const pages = citation.pages ? `: ${citation.pages}` : '';

                    const parts = [
                        `${authors},`,
                        `"${title},"`,
                        journal,
                        volume + number,
                        year && `(${year})`,
                        pages && pages
                    ].filter(part => part && part.length > 0);

                    return parts.join(' ')
                        .replace(/\s+/g, ' ')
                        .replace(/,\s*,/g, ',')
                        .replace(/\s+\./g, '.')
                        .trim() + '.';
                }).join('\n');
                break;

            case 'harvard-cite-them-right':
                formattedText = citations.map(citation => {
                    const authors = citation.author?.join(' and ') || 'No author';
                    const year = citation.year ? `(${citation.year})` : '';
                    const title = citation.title ? `'${citation.title}'` : '';
                    const journal = citation.journal || citation.booktitle || '';
                    const volume = citation.volume || '';
                    const number = citation.number ? `(${citation.number})` : '';
                    const pages = citation.pages ? `pp. ${citation.pages}` : '';

                    const parts = [
                        authors,
                        year,
                        title,
                        journal,
                        volume && number ? `${volume}${number}` : '',
                        pages
                    ].filter(part => part.length > 0);

                    return parts.join(', ')
                        .replace(/,\s*,/g, ',')
                        .replace(/\s+/g, ' ')
                        .replace(/\s+\./g, '.')
                        .trim() + '.';
                }).join('\n');
                break;

            case 'american-physics-society':
                formattedText = citations.map(citation => {
                    const authors = citation.author?.length ?
                        citation.author.join(', ') :
                        'No author';
                    const journal = citation.journal || citation.booktitle || '';
                    const volume = citation.volume || '';
                    const pages = citation.pages || '';
                    const year = citation.year ? ` (${citation.year})` : '';
                    const title = citation.title ? ` ${citation.title}` : '';

                    const journalPart = [
                        journal,
                        volume,
                        pages ? pages : ''
                    ].filter(part => part.length > 0).join(', ');

                    const parts = [
                        authors,
                        journalPart,
                        year + '.'
                    ].filter(part => part.length > 0);

                    return parts.join(', ') + title + '.';
                }).join('\n');
                break;

            default:
                formattedText = `Citation style '${selectedStyle}' not implemented yet.`;
        }

        setOutput(formattedText);
    };

    const handleStyleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newStyle = event.target.value;
        setStyle(newStyle);
        formatCitation(input, newStyle);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(event.target.value);
        formatCitation(event.target.value, style);
    };

    return (
        <>
            <JsonLd />
            <article className="w-full max-w-4xl mx-auto p-4 space-y-4">
                <header>
                    <h1 className="text-3xl font-bold mb-4">Academic Citation Formatter</h1>
                    <p className="text-gray-600 mb-6">
                        Transform your citations into various academic styles including IEEE, APA, MLA, and more.
                    </p>
                </header>

                <main className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-2xl font-bold mb-4">Citation Formatter</h2>

                                <div className="flex items-center gap-4 mb-4">
                                    <label className="flex-1">
                                        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-gray-400 transition-colors">
                                            <input
                                                type="file"
                                                accept=".bib,.yaml,.yml"
                                                onChange={handleFileUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="flex flex-col items-center gap-2">
                                                <Upload className="w-6 h-6 text-gray-500" />
                                                <span className="text-sm text-gray-600">Upload BibTeX or YAML file</span>
                                            </div>
                                        </div>
                                    </label>

                                    <div className="flex-1">
                                        <select
                                            value={style}
                                            onChange={handleStyleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {citationStyles.map((style) => (
                                                <option key={style.id} value={style.id}>
                                                    {style.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <textarea
                                    placeholder="Paste your BibTeX or YAML here..."
                                    value={input}
                                    onChange={handleInputChange}
                                    className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                                />

                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <h3 className="font-medium mb-2">Formatted Citations</h3>
                                    <div className="whitespace-pre-wrap">{output}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="mt-8 text-sm text-gray-500">
                    <p>Supported formats: BibTeX, YAML</p>
                    <p>Available citation styles: IEEE, APA, MLA, Chicago, Harvard, and more</p>
                </footer>
            </article>
        </>
    );
};

export default CitationFormatter;