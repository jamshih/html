#!/usr/bin/env python3
"""Hearframe Milestone 2 authentic-thought production builder.

Loads the frozen Milestone-1-compatible renderer and applies M2-only compatibility,
source, semantic-retrieval, and editorial gates. Spoken material is always selected
from authentic aligned corpus thoughts; the planner never writes replacement speech.
"""
from __future__ import annotations
import json, re, urllib.request
import numpy as np
from scipy.sparse import csr_matrix
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import Normalizer

CORE_COMMIT="f010624602d72f267ee3c6ba5086080d5cd7e0e4"
CORE_URL=f"https://raw.githubusercontent.com/jamshih/html/{CORE_COMMIT}/.github/scripts/hearframe-m2-build.py"
with urllib.request.urlopen(CORE_URL,timeout=30) as response:
    source=response.read().decode('utf-8')
fade_fix_count=source.count(':d=.04"')
if fade_fix_count!=1:raise RuntimeError(f'm2_bootstrap_expected_one_fade_fix_got_{fade_fix_count}')
source=source.replace(':d=.04"',':d=0.04"')
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

MODEL_NAME='tfidf-lsa-v2-editorial-gated'
STAGE_TERMS={
 'recognition':{'fear','afraid','worry','worried','uncertain','uncertainty','doubt','hard','difficult','challenge','struggle','pressure','lost','failure','failed','mistake','risk'},
 'reframe':{'learn','learned','learning','change','changed','different','perspective','failure','failed','mistake','experience','growth','grow','path','choice','challenge','understand'},
 'possibility':{'hope','future','dream','possible','possibility','opportunity','potential','believe','confidence','can','could','change','create','build','better'},
 'action':{'start','started','begin','began','act','action','do','did','work','worked','try','tried','choose','chose','make','made','keep','move','practice','build','create','take','responsibility','courage'},
}
GENERALIZABLE=('you ','you can','you have','you need','you should','we ','we can','we have','i learned','i learnt','i realized','i realised','i believe','i think','i found','the thing is','what matters','it is important','it\'s important','have to','need to','keep going','don\'t','do not')
QUESTION_OR_HOST=re.compile(r"(?:\?|\b(my question|can you|could you|would you|tell us|tell me|what do you|what are you|what is your|how do you|how did you|thanks for the question|thank you for the question|we(?:'re| are) joined|welcome to|as you mentioned)\b)",re.I)
INTRO_OR_SALUTATION=re.compile(r"^\s*(?:hi|hello|good morning|good afternoon|good evening|thank you|thanks|my name is|i(?:'m| am) [a-z]+(?: [a-z]+)?\b|vice president\b|mr\.? speaker\b|mr\.? chief justice\b|fellow citizens\b)",re.I)
DOMAIN_TRIVIA=re.compile(r"\b(space station|zero g|microgravity|handrail|our food|eat our food|experiment[s]? right now|wikipedia day|presidential campaign|vote for|democrat|republican)\b",re.I)
FILLER=re.compile(r"\b(um+|uh+|you know|sort of|kind of)\b",re.I)

class SemanticEncoder:
    def __init__(self,texts):
        self.vectorizer=TfidfVectorizer(lowercase=True,strip_accents='unicode',stop_words='english',ngram_range=(1,2),sublinear_tf=True,max_features=28000,token_pattern=r"(?u)\b[a-zA-Z][a-zA-Z'’-]+\b")
        sparse=self.vectorizer.fit_transform(texts);limit=min(sparse.shape);self.svd=None
        if limit>=4:
            self.svd=TruncatedSVD(n_components=min(160,limit-1),algorithm='randomized',n_iter=8,random_state=17);dense=self.svd.fit_transform(sparse)
        else:dense=sparse.toarray()
        self.normalizer=Normalizer(copy=False);self.normalizer.fit(dense);self.dimensions=int(dense.shape[1])
    def encode(self,texts,normalize_embeddings=True,batch_size=None,show_progress_bar=False,convert_to_numpy=True):
        sparse=self.vectorizer.transform(texts);dense=self.svd.transform(sparse) if self.svd is not None else sparse.toarray()
        if normalize_embeddings:dense=self.normalizer.transform(dense)
        return np.asarray(dense,dtype=np.float32)
    def transform(self,texts):return csr_matrix(self.encode(texts,normalize_embeddings=True,convert_to_numpy=True))

def add_embeddings(thoughts):
    texts=[t['transcript'] for t in thoughts];model=SemanticEncoder(texts);X=model.encode(texts,normalize_embeddings=True,convert_to_numpy=True)
    for i,t in enumerate(thoughts):t['topic_embedding']={'model':MODEL_NAME,'dimensions':int(X.shape[1]),'values':[round(float(x),5) for x in X[i].tolist()]}
    return model,X

def tokens(text):return re.findall(r"[a-z']+",text.lower())

def editorial_gate(stage,text):
    lo=' '.join(text.lower().split());ws=tokens(lo)
    reasons=[]
    if len(ws)<10:reasons.append('too_short_for_complete_thought')
    if len(ws)>85:reasons.append('too_long_for_single_story_beat')
    if QUESTION_OR_HOST.search(lo):reasons.append('question_or_interviewer_language')
    if INTRO_OR_SALUTATION.search(lo):reasons.append('introduction_greeting_or_salutation')
    if ns['FRAGMENT_START'].search(lo):reasons.append('context_dependent_fragment_start')
    if DOMAIN_TRIVIA.search(lo):reasons.append('domain_trivia_not_personally_generalizable')
    stage_hits=sorted(set(ws)&STAGE_TERMS.get(stage,set()))
    if not stage_hits:reasons.append('missing_stage_meaning')
    general_hits=[p for p in GENERALIZABLE if p in (' '+lo+' ') or lo.startswith(p)]
    # First-person reflective statements are allowed even without direct second-person advice.
    reflective=bool(re.search(r"\bi (learned|learnt|realized|realised|believe|think|found|failed|started|decided|wanted|had to|needed to)\b",lo))
    if not general_hits and not reflective:reasons.append('not_generalizable_or_reflective')
    filler_ratio=len(FILLER.findall(lo))/max(1,len(ws))
    if filler_ratio>.08:reasons.append('too_much_filler')
    return not reasons,{'reasons':reasons,'stageHits':stage_hits,'generalizableHits':general_hits[:6],'reflective':reflective,'wordCount':len(ws)}

def story_plan(prompt,thoughts,sources,model,X):
    STAGES=ns['STAGES'];STAGE_QUERY=ns['STAGE_QUERY'];theme_tags=ns['theme_tags'];OUT_THOUGHTS=ns['OUT_THOUGHTS'];OUT_STORY=ns['OUT_STORY'];ASK=ns['ASK']
    # Persist the searchable inventory before any render. This lets a failed story be debugged without rerunning ASR just to inspect corpus text.
    OUT_THOUGHTS.write_text(json.dumps({'version':'hearframe-m2-thought-inventory-v2','embeddingModel':MODEL_NAME,'count':len(thoughts),'thoughts':thoughts},ensure_ascii=False,indent=2)+'\n')
    if len(thoughts)<500:raise RuntimeError(f'thought_inventory_gate:{len(thoughts)}_lt_500')
    by_source={}
    for i,t in enumerate(thoughts):by_source.setdefault(t['source_id'],[]).append((i,t))
    q_prompt=model.encode([prompt],normalize_embeddings=True,convert_to_numpy=True)[0]
    q_stage={s:model.encode([STAGE_QUERY[s]+' '+prompt],normalize_embeddings=True,convert_to_numpy=True)[0] for s in STAGES}
    selected=[];used=set();inspector={'version':'hearframe-m2-story-inspector-v1','prompt':prompt,'embeddingModel':MODEL_NAME,'stages':[]}
    # Five dynamic beats + verified Obama resolution -> 6 distinct voices when available.
    target=['recognition','reframe','possibility','possibility','action']
    dynamic=[s for s in sources if not s.get('pinned_thoughts')]
    for stage in target:
        ranked=[];wanted=set(theme_tags(STAGE_QUERY[stage]));sq=q_stage[stage]
        for src in dynamic:
            if src['source_id'] in used:continue
            hints=[h.lower() for h in (src.get('retrieval_hints') or [])]
            for i,t in by_source.get(src['source_id'],[]):
                d=float(t['duration'])
                if not (6.5<=d<=17.5):continue
                ok,gate=editorial_gate(stage,t['transcript'])
                if not ok:continue
                semantic=float(np.dot(X[i],sq));personal=float(np.dot(X[i],q_prompt));lo=t['transcript'].lower();ws=set(tokens(lo))
                stage_hits=len(ws&STAGE_TERMS[stage]);stage_tags=len(set(t.get('themes') or [])&wanted);hint_hits=sum(1 for h in hints if h and h in lo)
                semantic_score=.38*semantic+.12*personal
                meaning_bonus=min(.18,.06*stage_hits);tag_bonus=min(.08,.025*stage_tags);hint_bonus=min(.07,.018*hint_hits)
                duration_bonus=.11*max(0,1-abs(d-11.5)/11.5);quality=.12*float(t.get('alignment_confidence') or 0)
                completeness=.07 if t.get('level') in ('thought','extended_thought') else .035
                reflective_bonus=.05 if gate['reflective'] else .035
                score=semantic_score+meaning_bonus+tag_bonus+hint_bonus+duration_bonus+quality+completeness+reflective_bonus
                ranked.append((score,src,t,gate,{'semantic':semantic,'prompt':personal,'meaning':meaning_bonus,'theme':tag_bonus,'hints':hint_bonus,'duration':duration_bonus,'quality':quality,'completeness':completeness,'reflective':reflective_bonus}))
        ranked.sort(key=lambda x:x[0],reverse=True)
        inspector['stages'].append({'stage':stage,'candidates':[{'score':round(r[0],4),'speaker':r[2]['speaker'],'thought_id':r[2]['thought_id'],'transcript':r[2]['transcript'],'gate':r[3],'scoreParts':{k:round(v,4) for k,v in r[4].items()}} for r in ranked[:8]]})
        if not ranked:raise RuntimeError(f'no_editorially_valid_candidate_for_{stage}')
        score,src,t,gate,parts=ranked[0];used.add(src['source_id'])
        selected.append({'stage':stage,'thought':t,'score':round(score,4),'scoreParts':{k:round(v,4) for k,v in parts.items()},'semantic_reason':f"Authentic {t['level']} passed the {stage} editorial gate, matched the listener situation semantically, and added a distinct approved speaker."})
    for src in sources:
        if not src.get('pinned_thoughts'):continue
        candidates=[t for _,t in by_source.get(src['source_id'],[]) if t.get('pinned_stage')]
        if candidates:
            t=max(candidates,key=lambda x:float(x.get('alignment_confidence') or 0));selected.append({'stage':'resolution','thought':t,'score':1.0,'scoreParts':{'verifiedAuthenticAnchor':1.0},'semantic_reason':'Verified authentic closing thought: it turns reflection into agency without changing or inventing any spoken word.'})
    order={s:i for i,s in enumerate(STAGES)};selected.sort(key=lambda x:order.get(x['stage'],99))
    out=[];speakers=set()
    for x in selected:
        sp=x['thought']['speaker_id']
        if sp in speakers:continue
        speakers.add(sp);out.append(x)
    inspector['selected']=[{'stage':x['stage'],'speaker':x['thought']['speaker'],'thought_id':x['thought']['thought_id'],'transcript':x['thought']['transcript'],'duration':x['thought']['duration'],'score':x['score']} for x in out]
    (ASK/'m2-story-inspector.json').write_text(json.dumps(inspector,ensure_ascii=False,indent=2)+'\n')
    if len(out)<5:raise RuntimeError(f'story_speaker_gate:{len(out)}')
    required={'recognition','reframe','possibility','action','resolution'}
    got={x['stage'] for x in out}
    if not required<=got:raise RuntimeError(f'story_stage_gate_missing:{sorted(required-got)}')
    dynamic_out=[x for x in out if x['stage']!='resolution']
    bad=[]
    for x in dynamic_out:
        ok,gate=editorial_gate(x['stage'],x['thought']['transcript'])
        if not ok:bad.append({'thought':x['thought']['thought_id'],'stage':x['stage'],'reasons':gate['reasons']})
    if bad:raise RuntimeError('story_editorial_regression:'+json.dumps(bad))
    estimated=sum(float(x['thought']['duration']) for x in out)
    if estimated<42:raise RuntimeError(f'story_spoken_duration_too_short:{estimated:.2f}')
    OUT_STORY.write_text(json.dumps({'version':'hearframe-m2-story-plan-v3','prompt':prompt,'estimatedSpokenSeconds':round(estimated,3),'selected':[{'stage':x['stage'],'speaker':x['thought']['speaker'],'thought_id':x['thought']['thought_id'],'transcript':x['thought']['transcript'],'duration':x['thought']['duration'],'score':x['score'],'semantic_reason':x['semantic_reason']} for x in out]},ensure_ascii=False,indent=2)+'\n')
    print('M2_STORY_EDITORIAL_GATE PASS',json.dumps([(x['stage'],x['thought']['speaker'],x['thought']['transcript']) for x in out],ensure_ascii=False),flush=True)
    return out

AUDIO_AUDITS=[]
def production_audio_audit(proxy):
    pr=ns['probe'](proxy);aud=[s for s in pr.get('streams',[]) if s.get('codec_type')=='audio']
    if not aud:
        result={'status':'REJECT','reasons':['no_audio_stream']};AUDIO_AUDITS.append(result);return result
    p=ns['run'](['ffmpeg','-hide_banner','-nostats','-t','120','-i',str(proxy),'-map','0:a:0','-af','volumedetect','-f','null','-'],check=False,capture=True,timeout=180);stderr=p.stderr or ''
    mean_match=re.search(r'mean_volume:\s*(-?inf|-?\d+(?:\.\d+)?)\s*dB',stderr,re.I);max_match=re.search(r'max_volume:\s*(-?inf|-?\d+(?:\.\d+)?)\s*dB',stderr,re.I)
    if p.returncode!=0:result={'status':'REJECT','reasons':['audio_decode_failed'],'decodeReturnCode':p.returncode}
    elif not max_match:result={'status':'REVIEW','reasons':['audio_level_measurement_missing']}
    else:
        raw=max_match.group(1).lower();max_db=float('-inf') if raw=='-inf' else float(raw);raw_mean=mean_match.group(1).lower() if mean_match else None;mean_db=(float('-inf') if raw_mean=='-inf' else float(raw_mean)) if raw_mean is not None else None
        status='APPROVE' if max_db>-55.0 else 'REVIEW';result={'status':status,'maxVolumeDbfs':max_db,'meanVolumeDbfs':mean_db,'sampleRate':aud[0].get('sample_rate'),'channels':aud[0].get('channels'),'reasons':[] if status=='APPROVE' else ['source_audio_near_silent_requires_review']}
    AUDIO_AUDITS.append(result);print('M2_AUDIO_AUDIT',proxy,result,flush=True);return result

_core_visual_audit=ns['visual_audit']
def production_visual_audit(proxy,source):
    result=_core_visual_audit(proxy,source)
    # These references already passed the 131-source human contact-sheet audit. Human approval may resolve a machine REVIEW, never a fresh machine REJECT.
    if source.get('visual_approval')=='APPROVE' and result.get('status')=='REVIEW':
        result['status']='APPROVE';result['reasons']=['human_131_source_contact_sheet_approval_persisted']
    return result

ns['add_embeddings']=add_embeddings;ns['story_plan']=story_plan;ns['audio_audit']=production_audio_audit;ns['visual_audit']=production_visual_audit
print(f'Hearframe M2 core {CORE_COMMIT}; semantic retrieval={MODEL_NAME}; random-story fail-closed gate; FFmpeg/ASS compatibility fixes; direct-decode audio gate.',flush=True)
ns['main']()
