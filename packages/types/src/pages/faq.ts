export interface FAQItem {
    id: number
    question: string
    answer: string
    categoryIds: number[]
}

export type FAQList = FAQItem[]

export interface FAQCat {
    id: number;
    title: string;
    counter: string;
}

export type FAQCatList = FAQCat[]

export interface FAQCategory {
    id: number
    title: string
    description: string
    faqIds: number[]
}

export type FAQCategoryList = FAQCategory[]
