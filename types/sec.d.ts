interface AbstractParser<Ast, Meta> {
    (code: string, meta: Meta): (Ast | null);
}
interface ParserTransformer<Ast, Meta> {
    (...params: any[]): AbstractParser<Ast, Meta>;
}
interface Dict<T> {
    [key: string]: T;
}
declare function most<T>(array: T[], fn: (value: T, id: number) => number): [T | null, number];
declare function spaceArray<T, Stuff>(array: T[], fillWith: Stuff): (T | Stuff)[];
interface LaterFn {
    (...args: any[]): any;
    resolve: ((impl: (...args: any[]) => any) => any);
}
declare function later(): LaterFn;
interface Ast {
    type: NodeType;
    length: number;
    code: string;
}
declare type Parser = AbstractParser<Ast, Meta>;
declare type Transformer = ParserTransformer<Ast, Meta>;
declare type NodeType = string;
interface Meta {
    usedParsers: Parser[];
}
declare function re(type: NodeType, regexp: RegExp): Parser;
declare function literal(code: string, type?: NodeType): Parser;
declare function oneOf(variants: Parser[]): Parser;
declare function someOf(type: NodeType, itemParser: Parser): Parser;
interface StructItem {
    name: string | null;
    parser: Parser;
    optional: boolean;
}
declare function structure(type: NodeType, scheme: StructItem[]): Parser;
interface SugarStructParser {
    [key: string]: Parser;
}
declare type SugarStructItem = SugarStructParser | string | Parser | [SugarStructParser | string | Parser];
declare function struct(type: NodeType, whitespacer: Parser | null, pattern: SugarStructItem[]): AbstractParser<Ast, Meta>;
declare type BiopItem = [string, string];
declare function binaryOps(operands: Parser[], items: BiopItem[]): [Dict<Parser>, Parser[]];
declare const number: AbstractParser<Ast, Meta>;
declare const id: AbstractParser<Ast, Meta>;
declare const whitespace: AbstractParser<Ast, Meta>;
declare const operand: AbstractParser<Ast, Meta>;
declare const expression: AbstractParser<Ast, Meta>;
declare const s_if: AbstractParser<Ast, Meta>;
declare const biops: Dict<AbstractParser<Ast, Meta>>, biopsList: AbstractParser<Ast, Meta>[];
declare const expr: AbstractParser<Ast, Meta>;
