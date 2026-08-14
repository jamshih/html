#!/usr/bin/env python3
"""Milestone 2 builder bootstrap with authentic thought-first semantic retrieval.

The frozen core keeps the media/render/QA implementation reproducible. We load it
as a module (so its main() does not auto-run), apply the Python 3.11 ASS syntax
repair, then replace only the retrieval embedding/planner functions with an
in-run TF-IDF + latent-semantic-analysis encoder using the already-approved
scikit-learn dependency. The spoken material remains authentic corpus thoughts.
"""
from __future__ import annotations
import urllib.request
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import Normalizer

CORE_COMMIT="f010624602d72f267ee3c6ba5086080d5cd7e0e4"
CORE_URL=f"https://raw.githubusercontent.com/jamshih/html/{CORE_COMMIT}/.github/scripts/hearframe-m2-build.py"
with urllib.request.urlopen(CORE_URL,timeout=30) as response:
    source=response.read().decode('utf-8')
lines=source.splitlines();patched=[];fix_count=0
for line in lines:
    if line.strip().startswith('vf=f"ass={str(ass).replace'):
        indent=line[:len(line)-len(line.lstrip())]
        patched.append(indent+'escaped_ass = str(ass).replace(":", r"\\:")')
        patched.append(indent+'vf=f"ass={escaped_ass},tpad=stop_mode=clone:stop_duration=2.4"')
        fix_count+=1
    else:patched.append(line)
if fix_count!=1:raise RuntimeError(f'm2_bootstrap_expected_one_ass_fix_got_{fix_count}')
code='\n'.join(patched)+'\n';compile(code,__file__,'exec')
ns={'__name__':'hearframe_m2_core','__file__':__file__}
exec(compile(code,__file__,'exec'),ns,ns)

MODEL_NAME='tfidf-lsa-v1'

class SemanticEncoder:
    def __init__(self,texts):
        self.vectorizer=TfidfVectorizer(
            lowercase=True,strip_accents='unicode',stop_words='english',
            ngram_range=(1,2),sublinear_tf=True,max_features=24000,
            token_pattern=r"(?u)\b[a-zA-Z][a-zA-Z'’-]+\b"
        )
        sparse=self.vectorizer.fit_transform(texts)
        limit=min(sparse.shape)
        self.svd=None
        if limit>=4:
            n_components=min(128,limit-1)
            self.svd=TruncatedSVD(n_components=n_components,algorithm='randomized',n_iter=7,random_state=17)
            dense=self.svd.fit_transform(sparse)
        else:
            dense=sparse.toarray()
        self.normalizer=Normalizer(copy=False)
        self.normalizer.fit(dense)
        self.dimensions=int(dense.shape[1])

    def encode(self,texts,normalize_embeddings=True,batch_size=None,show_progress_bar=False,convert_to_numpy=True):
        sparse=self.vectorizer.transform(texts)
        dense=self.svd.transform(sparse) if self.svd is not None else sparse.toarray()
        if normalize_embeddings:
            dense=self.normalizer.transform(dense)
        return np.asarray(dense,dtype=np.float32)

def add_embeddings(thoughts):
    texts=[t['transcript'] for t in thoughts]
    model=SemanticEncoder(texts)
    X=model.encode(texts,normalize_embeddings=True,convert_to_numpy=True)
    for i,t in enumerate(thoughts):
        t['topic_embedding']={
            'model':MODEL_NAME,
            'dimensions':int(X.shape[1]),
            'values':[round(float(x),5) for x in X[i].tolist()]
        }
    return model,X

def story_plan(prompt,thoughts,sources,model,X):
    STAGES=ns['STAGES'];STAGE_QUERY=ns['STAGE_QUERY'];theme_tags=ns['theme_tags']
    by_source={}
    for i,t in enumerate(thoughts):by_source.setdefault(t['source_id'],[]).append((i,t))
    q_prompt=model.encode([prompt],normalize_embeddings=True,convert_to_numpy=True)[0]
    q_stage={s:model.encode([STAGE_QUERY[s]+' '+prompt],normalize_embeddings=True,convert_to_numpy=True)[0] for s in STAGES}
    selected=[];used=set();target=['recognition','reframe','possibility','possibility','action']
    dynamic=[s for s in sources if not s.get('pinned_thoughts')]
    for stage in target:
        best=None
        wanted=set(theme_tags(STAGE_QUERY[stage])); sq=q_stage[stage]
        for src in dynamic:
            if src['source_id'] in used:continue
            hints=[h.lower() for h in (src.get('retrieval_hints') or [])]
            for i,t in by_source.get(src['source_id'],[]):
                d=float(t['duration'])
                if not (6.0<=d<=16.5):continue
                semantic=float(np.dot(X[i],sq));personal=float(np.dot(X[i],q_prompt))
                stage_tags=len(set(t.get('themes') or []) & wanted)
                hint_hits=sum(1 for h in hints if h and h in t['transcript'].lower())
                tag_bonus=.035*stage_tags;hint_bonus=min(.08,.02*hint_hits)
                duration_bonus=.10*max(0,1-abs(d-10)/10)
                quality=.13*float(t.get('alignment_confidence') or 0)
                completeness=.05 if t.get('level') in ('thought','extended_thought') else .02
                score=.50*semantic+.18*personal+tag_bonus+hint_bonus+duration_bonus+quality+completeness
                if best is None or score>best[0]:
                    best=(score,src,t,{'semantic':semantic,'prompt':personal,'theme':tag_bonus,'hints':hint_bonus,'duration':duration_bonus,'quality':quality,'completeness':completeness})
        if best:
            score,src,t,parts=best;used.add(src['source_id'])
            selected.append({'stage':stage,'thought':t,'score':round(score,4),'scoreParts':{k:round(v,4) for k,v in parts.items()},
              'semantic_reason':f"Latent semantic retrieval for {stage}: authentic complete {t['level']} matched the prompt/stage while adding a distinct speaker; alignment/quality/duration gates also passed."})
    for src in sources:
        if not src.get('pinned_thoughts'):continue
        candidates=[t for _,t in by_source.get(src['source_id'],[]) if t.get('pinned_stage')]
        if candidates:
            t=max(candidates,key=lambda x:float(x.get('alignment_confidence') or 0));stage=t['pinned_stage']
            selected.append({'stage':stage,'thought':t,'score':1.0,'scoreParts':{'verifiedAuthenticAnchor':1.0},
              'semantic_reason':f"Verified authentic {stage} anchor from a locally renderable source; final spoken/caption words still come from aligned audio."})
    order={s:i for i,s in enumerate(STAGES)}
    selected.sort(key=lambda x:(order[x['stage']],0 if x['stage']!='action' else (0 if x['thought']['speaker_id']!='barack-obama' else 1)))
    out=[];speakers=set()
    for x in selected:
        sp=x['thought']['speaker_id']
        if sp in speakers:continue
        speakers.add(sp);out.append(x)
    if len(out)<5:raise RuntimeError(f"story_speaker_gate:{len(out)}")
    return out

ns['add_embeddings']=add_embeddings
ns['story_plan']=story_plan
print(f'Hearframe M2 core {CORE_COMMIT}; semantic retrieval={MODEL_NAME}; ASS syntax repaired.',flush=True)
ns['main']()
