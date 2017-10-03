import { AbstractParser, ParserTransformer } from './abstract';
export interface Ast {
    type: NodeType;
    length: number;
    code: string;
}
export declare type Parser = AbstractParser<Ast, Meta>;
export declare type Transformer = ParserTransformer<Ast, Meta>;
export declare type NodeType = string;
export interface Meta {
    usedParsers: Parser[];
}
export declare function re(type: NodeType, regexp: RegExp): Parser;
export declare function literal(code: string, type?: NodeType): Parser;
export declare function oneOf(variants: Parser[]): Parser;
export declare function someOf(type: NodeType, itemParser: Parser): Parser;
export interface StructItem {
    name: string | null;
    parser: Parser;
    optional: boolean;
}
export declare function structure(type: NodeType, scheme: StructItem[]): Parser;
