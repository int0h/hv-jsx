export interface AbstractParser<Ast, Meta> {
    (code: string, meta: Meta): (Ast | null);
}
export interface ParserTransformer<Ast, Meta> {
    (...params: any[]): AbstractParser<Ast, Meta>;
}
