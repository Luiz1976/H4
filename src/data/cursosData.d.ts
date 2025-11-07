export interface Modulo {
    id: number;
    titulo: string;
    duracao: string;
    topicos: string[];
    materialDidatico: string;
}
export interface Curso {
    id: number;
    slug: string;
    titulo: string;
    subtitulo: string;
    descricao: string;
    duracao: string;
    nivel: "Iniciante" | "Intermediario" | "Avancado";
    categoria: string;
    icone: string;
    cor: string;
    corBadge: string;
    objetivo: string;
    resultadosEsperados: string[];
    modulos: Modulo[];
    atividadesPraticas?: string[];
    integracaoPGR?: string[];
}
export declare const cursos: Curso[];
export declare const getCursoBySlug: (slug: string) => Curso | undefined;
export declare const getAllCursos: () => Curso[];
//# sourceMappingURL=cursosData.d.ts.map