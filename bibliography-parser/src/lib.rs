
use biblatex::Entry;
use std::error::Error;

fn format_authors(authors: &[biblatex::Person], style: &str) -> String {
    match (style, authors.len()) {
        ("ieee", n) if n > 3 => {
            format!("{} et al.", authors[0].name)
        },
        ("apa", n) if n > 7 => {
            let first_six = authors[..6].iter()
                .map(|a| a.name.to_string())
                .collect::<Vec<_>>()
                .join(", ");
            format!("{}, ... {}", first_six, authors.last().unwrap().name)
        },
        (_, n) => {
            authors.iter()
                .map(|a| a.name.to_string())
                .collect::<Vec<_>>()
                .join(", ")
        }
    }
}

fn format_entry_ieee(entry: &Entry) -> Result<String, Box<dyn Error>> {
    let authors = entry.author()
        .map(|authors| format_authors(authors, "ieee"))
        .unwrap_or_else(|_| String::from("Unknown Author"));

    let title = entry.title()?.concat();
    let year = entry.year()?.map_or("n.d.".to_string(), |y| y.to_string());
    
    let formatted = match entry.entry_type {
        biblatex::EntryType::Article => {
            let journal = entry.journal()?.concat();
            let volume = entry.volume().map(|v| v.concat()).unwrap_or_default();
            let number = entry.number().map(|n| format!(", no. {}", n.concat())).unwrap_or_default();
            let pages = entry.pages()
                .map(|p| format!(", pp. {}", p.concat()))
                .unwrap_or_default();
            let doi = entry.doi()
                .map(|d| format!(", doi: {}", d.concat()))
                .unwrap_or_default();

            format!("{}. \"{}\", {} vol.{}{}{}{}, {}.",
                authors, title, journal, volume, number, pages, doi, year)
        },
        biblatex::EntryType::Book => {
            let publisher = entry.publisher()?.concat();
            let address = entry.address()
                .map(|a| format!("{}: ", a.concat()))
                .unwrap_or_default();
            let edition = entry.edition()
                .map(|e| format!("{} ed., ", e.concat()))
                .unwrap_or_default();

            format!("{}. \"{}\". {}{}{}, {}.",
                authors, title, edition, address, publisher, year)
        },
        _ => format!("{}. \"{}\". {}.", authors, title, year),
    };

    Ok(formatted)
}

fn format_entry_apa(entry: &Entry) -> Result<String, Box<dyn Error>> {
    let authors = entry.author()
        .map(|authors| format_authors(authors, "apa"))
        .unwrap_or_else(|_| String::from("Unknown Author"));

    let title = entry.title()?.concat();
    let year = entry.year()?.map_or("n.d.".to_string(), |y| y.to_string());

    let formatted = match entry.entry_type {
        biblatex::EntryType::Article => {
            let journal = entry.journal()?.concat();
            let volume = entry.volume().map(|v| v.concat()).unwrap_or_default();
            let number = entry.number()
                .map(|n| format!("({})", n.concat()))
                .unwrap_or_default();
            let pages = entry.pages()
                .map(|p| format!(", {}", p.concat()))
                .unwrap_or_default();
            let doi = entry.doi()
                .map(|d| format!(". https://doi.org/{}", d.concat()))
                .unwrap_or_default();

            format!("{}. ({}). {}. {}, {}{}{}{}", 
                authors, year, title, journal, volume, number, pages, doi)
        },
        biblatex::EntryType::Book => {
            let publisher = entry.publisher()?.concat();
            let address = entry.address()
                .map(|a| format!("{}. ", a.concat()))
                .unwrap_or_default();

            format!("{}. ({}). {}. {}{}", 
                authors, year, title, address, publisher)
        },
        _ => format!("{}. ({}). {}.", authors, year, title),
    };

    Ok(formatted)
}
use wasm_bindgen::prelude::*;
use biblatex::{Bibliography, Entry, RetrievalError};

#[wasm_bindgen]
pub fn parse_and_format(bib_content: &str, style: &str) -> Result<String, JsValue> {
    let bib = Bibliography::parse(bib_content)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    
    let entries: Vec<String> = bib.iter()
        .filter_map(|(_, entry)| {
            match style {
                "ieee" => format_entry_ieee(entry).ok(),
                "apa" => format_entry_apa(entry).ok(),
                _ => None,
            }
        })
        .collect();

    Ok(entries.join("\n\n"))
}

fn format_entry_ieee(entry: &Entry) -> Result<String, RetrievalError> {
    let authors = match entry.author() {
        Ok(authors) => authors.iter()
            .map(|author| format!("{}", author.name))
            .collect::<Vec<_>>()
            .join(", "),
        Err(_) => String::from("Unknown Author"),
    };

    let title = entry.title()?.concat();
    let year = entry.year()?.map_or("n.d.".to_string(), |y| y.to_string());
    
    let formatted = match entry.entry_type {
        biblatex::EntryType::Article => {
            let journal = entry.journal()?.concat();
            format!("{}. \"{}\", {}, {}.", authors, title, journal, year)
        },
        biblatex::EntryType::Book => {
            let publisher = entry.publisher()?.concat();
            format!("{}. \"{}\". {}, {}.", authors, title, publisher, year)
        },
        _ => format!("{}. \"{}\". {}.", authors, title, year),
    };

    Ok(formatted)
}

fn format_entry_apa(entry: &Entry) -> Result<String, RetrievalError> {
    let authors = match entry.author() {
        Ok(authors) => authors.iter()
            .map(|author| format!("{}", author.name))
            .collect::<Vec<_>>()
            .join(", "),
        Err(_) => String::from("Unknown Author"),
    };

    let title = entry.title()?.concat();
    let year = entry.year()?.map_or("n.d.".to_string(), |y| y.to_string());

    let formatted = match entry.entry_type {
        biblatex::EntryType::Article => {
            let journal = entry.journal()?.concat();
            format!("{}. ({}). {}. {}.", authors, year, title, journal)
        },
        biblatex::EntryType::Book => {
            let publisher = entry.publisher()?.concat();
            format!("{}. ({}). {}. {}.", authors, year, title, publisher)
        },
        _ => format!("{}. ({}). {}.", authors, year, title),
    };

    Ok(formatted)
}
use wasm_bindgen::prelude::*;
use biblatex::{Bibliography, Entry};
use serde::{Serialize, Deserialize};

#[wasm_bindgen]
pub fn parse_and_format(bib_content: &str, style: &str) -> Result<String, JsValue> {
    let bib = Bibliography::parse(bib_content)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;
    
    let formatted = match style {
        "ieee" => format_ieee(&bib),
        "apa" => format_apa(&bib),
        _ => return Err(JsValue::from_str("Unsupported style")),
    };
    
    Ok(formatted)
}

fn format_ieee(bib: &Bibliography) -> String {
    // ...IEEE形式でフォーマット...
    String::new()
}

fn format_apa(bib: &Bibliography) -> String {
    // ...APA形式でフォーマット...
    String::new()
}
