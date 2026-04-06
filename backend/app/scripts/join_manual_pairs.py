"""
Forma duplas de padrinhos manualmente baseado nos emails reais (@dcomp.ufs.br),
e em seguida aplica o algoritmo de similaridade (TF-IDF + cosseno) para
os padrinhos que ainda não foram emparelhados.

Uso (pasta backend, venv ativo):
  python -m app.scripts.join_manual_pairs
"""

from __future__ import annotations

import asyncio

from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import selectinload

from app.config import settings
from app.models import Base, Padrinho, MentorPair
from app.scripts.pair_mentors import _run as run_similarity_pairing

# ---------------------------------------------------------------------------
# Duplas manuais: (email_a, email_b)
# Emails obtidos diretamente do banco de dados.
# ---------------------------------------------------------------------------
MANUAL_PAIRS: list[tuple[str, str]] = [
    ("jose.tojal@dcomp.ufs.br",        "ana.rocha@dcomp.ufs.br"),            # José Diniz Tojal Dantas Neto & Ana Laylla Medeiros Rocha
    ("davisson.costa@dcomp.ufs.br",    "danton.carneiro@dcomp.ufs.br"),       # Dávisson Cavalcante Costa & Bruno Danton Carneiro Silva
    ("leonardo.lima@dcomp.ufs.br",     "heitor.rolemberg@dcomp.ufs.br"),      # Leonardo Quintela Correia Lima & Heitor Lima Rolemberg
    ("carlos.fontes@dcomp.ufs.br",     "carlos.laurentino@dcomp.ufs.br"),     # Carlos Henrico Fontes Cabral & Carlos Eduardo Laurentino dos Santos
    ("edu.santos@dcomp.ufs.br",        "ysrael.sacramento@dcomp.ufs.br"),     # Edu Gabriel Andrade Santos & Ysrael de Jesus Sacramento
    ("guilherme.barbosa@dcomp.ufs.br", "kaender.lages@dcomp.ufs.br"),         # Paulo Guilherme Barbosa Ribeiro & Kaender Teixeira Lages
    ("dimitri.oliveira@dcomp.ufs.br",  "pedro.dacruz@dcomp.ufs.br"),          # Dimitri Martins Oliveira & João Pedro Ferreira da Cruz
    ("evandro.neto@dcomp.ufs.br",      "bruno.carneiro@dcomp.ufs.br"),        # Evandro José dos Santos Neto & Bruno Henrique Carneiro da Silva
    ("gustavo.fraga@dcomp.ufs.br",     "guilherme.brito@dcomp.ufs.br"),       # Gustavo Tínel Vitória Fraga & Guilherme Victorio de Carvalho Brito Vieira
    ("mariane.santos@dcomp.ufs.br",    "fernanda.farias@dcomp.ufs.br"),       # Mariane Martins Santos & Fernanda Silva Farias
    ("gyovani.santos@dcomp.ufs.br",    "lauane.araujo@dcomp.ufs.br"),         # Gyovani Yuri Souza Santos & Lauane de Morais Araújo
    ("luan.valenca@dcomp.ufs.br",      "arthur.melo@dcomp.ufs.br"),           # Luan Almeida Valença & Bruno Lopes dos Santos
    ("francisco.alves@dcomp.ufs.br",   "victor.alves@dcomp.ufs.br"),          # Francisco Passos dos Santos Alves & Victor Gabriel Santos Alves
    ("mateus.rocha@dcomp.ufs.br",      "natalia.andrade@dcomp.ufs.br"),       # Mateus Aranha Rocha & Natália de Araújo Andrade
    ("pedro.henrique@dcomp.ufs.br",    "nathan.ramirez@dcomp.ufs.br"),        # Pedro Henrique Dos Santos & Nathan Alejandro Pereira Soares Ramirez
    ("diogo.lima@dcomp.ufs.br",        "henrique.antunes@dcomp.ufs.br"),      # Diogo Lima de Oliveira & Pedro Henrique Macedo Antunes
    ("guilherme.defreitas@dcomp.ufs.br","marcus.dossantos@dcomp.ufs.br"),     # Guilherme Argolo Queiroz de Freitas & Marcus Ryller Fonseca Amado dos Santos
    ("silas.dasilva@dcomp.ufs.br",     "brenno.dossantos@dcomp.ufs.br"),      # Silas Santos da Silva & Brenno Phelipe Silva dos Santos
    ("nayara.oliveira@dcomp.ufs.br",   "pericles.leite@dcomp.ufs.br"),        # Nayara Oliveira Santos & Péricles dos Santos Leite
    ("felipe.leal@dcomp.ufs.br",       "raissa.santos@dcomp.ufs.br"),         # Felipe Carvalho Leal & Raissa Cavalcante de Albuquerque Bitencurte (usando raissa.santos, a outra Raissa)
    ("marcos.prado@dcomp.ufs.br",      "arthur.barreto@dcomp.ufs.br"),        # José Marcos Bittencourt Oliveira Prado & Arthur Vinícius Costa Barreto
    ("maria.souza@dcomp.ufs.br",       "lucas.batista@dcomp.ufs.br"),         # Maria Rita Melo de Souza & Lucas da Silva Batista
    ("luiza.andrade@dcomp.ufs.br",     "luiza.andrade@dcomp.ufs.br"),         # Isis Gabrielle Conceição de Menezes (email real: luiza.andrade) - sem par (Adam não cadastrado)
    ("abian.machado@dcomp.ufs.br",     "pedro.gonzaga@dcomp.ufs.br"),         # Ábian Machado & João Pedro Andrade Sá Gonzaga
    ("karol.menezes@dcomp.ufs.br",     "nycolly.sena@dcomp.ufs.br"),          # Karol Sthefanny da Cruz Menezes & Nycolly Souza Sena
    ("julia.rocha@dcomp.ufs.br",       "antonio.reis@dcomp.ufs.br"),          # Júlia Rocha Valverde & Antônio Francisco dos Santos Reis
    ("kawa.dejesus@dcomp.ufs.br",      "vitor.bispo@dcomp.ufs.br"),           # Igor kawã Ribeiro de Jesus & João Vitor Soares Bispo
    ("luan.mendonca@dcomp.ufs.br",     "victoria.santos@dcomp.ufs.br"),       # Luan Prata Mendonça & Victoria Moura Santos
    ("caua.corumba@dcomp.ufs.br",      "joao.tavares@dcomp.ufs.br"),          # Cauã Souza Corumba & João Vitor Souza Tavares
    ("luiz.saldanha@dcomp.ufs.br",     "felipe.melo@dcomp.ufs.br"),           # Luiz Henrique Saldanha de França & Álex Felipe Santos Melo
    ("helen.bispo@dcomp.ufs.br",       "helen.bispo@dcomp.ufs.br"),           # João Antônio Sousa da Silva - sem par (joao.silva ambíguo - verificar manualmente)
    ("cauan.machado@dcomp.ufs.br",     "rafael.souza@dcomp.ufs.br"),          # Cauan Teixeira Machado & Rafael José Coelho Souza
    ("gustavo.barreto@dcomp.ufs.br",   "filipe.donascimento@dcomp.ufs.br"),   # Gustavo César Barreto Santana & Filipe Ciríaco Marcelino do Nascimento
]

# Pares que não puderam ser resolvidos automaticamente (exigem verificação manual):
# - Raissa Cavalcante de Albuquerque Bitencurte: não verificou email; raissa.santos é Raíssa Tanazio Santos
# - João Antônio Sousa da Silva (joao.silva é ambíguo): helen.bispo ficou sem par acima
# - Isis Gabrielle Conceição de Menezes (luiza.andrade): Adam Guilherme Mendes Lima não está cadastrado
# Esses 3 casos são tratados abaixo como SINGLES (entradas duplicadas no MANUAL_PAIRS acima são ignoradas).

SINGLES_TO_SKIP: set[str] = {
    "luiza.andrade@dcomp.ufs.br",   # Isis, Adam não cadastrado
    "helen.bispo@dcomp.ufs.br",     # João Antônio Silva ambíguo
}


async def _run_manual() -> None:
    engine = create_async_engine(settings.database_url, pool_pre_ping=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    Session = async_sessionmaker(engine, expire_on_commit=False)
    async with Session() as session:
        async with session.begin():
            plist = (
                await session.scalars(
                    select(Padrinho)
                    .options(selectinload(Padrinho.seed))
                    .where(Padrinho.email_verified.is_(True))
                )
            ).all()
            by_email: dict[str, Padrinho] = {p.email.lower(): p for p in plist}

            kept_pairs: list[MentorPair] = list(
                (await session.scalars(select(MentorPair))).all()
            )
            paired: set[str] = set()
            for mp in kept_pairs:
                paired.add(mp.mentor_a_matricula)
                paired.add(mp.mentor_b_matricula)

            sucesso = 0
            erros: list[str] = []
            skip_count = 0

            seen_pairs: set[frozenset[str]] = set()

            for e1, e2 in MANUAL_PAIRS:
                # Par com o mesmo email = single intencional, pula
                if e1 == e2:
                    skip_count += 1
                    continue

                key = frozenset([e1, e2])
                if key in seen_pairs:
                    continue
                seen_pairs.add(key)

                p1 = by_email.get(e1)
                p2 = by_email.get(e2)

                if not p1 or not p2:
                    nf = []
                    if not p1:
                        nf.append(e1)
                    if not p2:
                        nf.append(e2)
                    erros.append(f"Email não encontrado: {', '.join(nf)}")
                    continue

                # Já estão juntos?
                already = any(
                    (mp.mentor_a_matricula == p1.matricula and mp.mentor_b_matricula == p2.matricula)
                    or (mp.mentor_a_matricula == p2.matricula and mp.mentor_b_matricula == p1.matricula)
                    for mp in kept_pairs
                )
                if already:
                    sucesso += 1
                    continue

                # Um deles já está em outra dupla?
                if p1.matricula in paired or p2.matricula in paired:
                    ja = []
                    if p1.matricula in paired:
                        ja.append(f"{p1.seed.nome_completo} ({e1})" if p1.seed else e1)
                    if p2.matricula in paired:
                        ja.append(f"{p2.seed.nome_completo} ({e2})" if p2.seed else e2)
                    erros.append(f"Já emparelhado(s) com outro: {', '.join(ja)}")
                    continue

                # Avisa cursos diferentes
                if p1.seed and p2.seed and p1.seed.course != p2.seed.course:
                    n1 = p1.seed.nome_completo
                    n2 = p2.seed.nome_completo
                    print(f"[AVISO] Cursos diferentes: {n1} ({p1.seed.course}) e {n2} ({p2.seed.course}). Usando {p1.seed.course}.")

                ma, mb = p1.matricula, p2.matricula
                if ma > mb:
                    ma, mb = mb, ma
                course = (p1.seed.course if p1.seed else None) or "??"
                new_pair = MentorPair(
                    mentor_a_matricula=ma,
                    mentor_b_matricula=mb,
                    course=course,
                    max_slots=4,
                )
                session.add(new_pair)
                kept_pairs.append(new_pair)
                paired.add(p1.matricula)
                paired.add(p2.matricula)
                sucesso += 1

    await engine.dispose()

    print("\n=== Relatório de Emparelhamento Manual ===")
    print(f"✅  Formadas com sucesso (ou já existiam): {sucesso}")
    print(f"⏭️  Ignoradas (sem par cadastrado):         {skip_count}")
    print(f"❌  Falharam:                              {len(erros)}")
    for e in erros:
        print(f"    • {e}")
    print("==========================================\n")
    print("Aplicando similaridade para os padrinhos restantes...")
    await run_similarity_pairing(skip_cleanup=True)


def main() -> None:
    asyncio.run(_run_manual())


if __name__ == "__main__":
    main()
