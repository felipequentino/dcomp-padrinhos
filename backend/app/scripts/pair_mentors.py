"""
Forma duplas de padrinhos verificados por similaridade (TF-IDF + cosseno),
apenas dentro do mesmo curso (CC / SI / EC).

Remove duplas que ainda não têm calouros vinculados e recria o pareamento
para padrinhos ainda não pareados.

Uso (pasta backend, venv ativo):
  python -m app.scripts.pair_mentors
"""

from __future__ import annotations

import asyncio
from collections import defaultdict

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import selectinload

from app.config import settings
from app.models import Base, FreshmanSelection, MentorPair, Padrinho


def _profile_text(p: Padrinho) -> str:
    s = p.seed
    parts = [
        (s.motivation_text if s else "") or "",
        (p.personal_description or "") or "",
        (p.hobby or "") or "",
        (p.computing_area or "") or "",
    ]
    t = " ".join(x.strip() for x in parts if x and x.strip())
    return t if t else "padrinho"


def _greedy_pairs(sim: np.ndarray, n: int) -> list[tuple[int, int]]:
    idxs = set(range(n))
    out: list[tuple[int, int]] = []
    while len(idxs) >= 2:
        rest = sorted(idxs)
        best_i, best_j, best_s = rest[0], rest[1], -1.0
        for a in range(len(rest)):
            for b in range(a + 1, len(rest)):
                i, j = rest[a], rest[b]
                if sim[i, j] > best_s:
                    best_s = sim[i, j]
                    best_i, best_j = i, j
        out.append((best_i, best_j))
        idxs.discard(best_i)
        idxs.discard(best_j)
    return out


async def _run() -> None:
    engine = create_async_engine(settings.database_url, pool_pre_ping=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    Session = async_sessionmaker(engine, expire_on_commit=False)
    async with Session() as session:
        async with session.begin():
            used_pairs = select(FreshmanSelection.pair_id).distinct()
            await session.execute(delete(MentorPair).where(MentorPair.id.not_in(used_pairs)))

            paired_matriculas: set[str] = set()
            kept = (await session.scalars(select(MentorPair))).all()
            for mp in kept:
                paired_matriculas.add(mp.mentor_a_matricula)
                paired_matriculas.add(mp.mentor_b_matricula)

            plist = (
                await session.scalars(
                    select(Padrinho)
                    .options(selectinload(Padrinho.seed))
                    .where(Padrinho.email_verified.is_(True))
                )
            ).all()

            by_course: dict[str, list[Padrinho]] = defaultdict(list)
            for p in plist:
                if p.seed is None:
                    continue
                if p.matricula in paired_matriculas:
                    continue
                by_course[p.seed.course].append(p)

            created = 0
            for course, members in sorted(by_course.items()):
                if len(members) < 2:
                    if len(members) == 1:
                        print(f"[{course}] Sem par para matrícula {members[0].matricula} (só 1 disponível).")
                    continue

                texts = [_profile_text(p) for p in members]
                vec = TfidfVectorizer(max_features=800, min_df=1, strip_accents="unicode")
                X = vec.fit_transform(texts)
                sim = np.asarray(cosine_similarity(X))
                np.fill_diagonal(sim, 0.0)

                pairs_idx = _greedy_pairs(sim, len(members))
                used_idx: set[int] = set()
                for i, j in pairs_idx:
                    a, b = members[i], members[j]
                    ma, mb = a.matricula, b.matricula
                    if ma > mb:
                        ma, mb = mb, ma
                    session.add(
                        MentorPair(
                            mentor_a_matricula=ma,
                            mentor_b_matricula=mb,
                            course=course,
                            max_slots=4,
                        )
                    )
                    created += 1
                    used_idx.add(i)
                    used_idx.add(j)
                for i in range(len(members)):
                    if i not in used_idx:
                        print(f"[{course}] Sem par para matrícula {members[i].matricula}.")

        print(f"Criadas {created} duplas novas.")

    await engine.dispose()


def main() -> None:
    asyncio.run(_run())


if __name__ == "__main__":
    main()
