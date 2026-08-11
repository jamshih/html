from __future__ import annotations

from collections import Counter
from pathlib import Path
import json
import re

ROOT = Path('hearframe-grand-v4/ask')
SOURCE = ROOT / 'reference-bank-v3.json'
CURATED = ROOT / 'public-speech-interview-bank.json'
REPORT = ROOT / 'video-pool-audit-report.json'
REVIEW = ROOT / 'video-pool-audit-review.json'
REJECTED = ROOT / 'video-pool-audit-rejected-sample.json'

bank = json.loads(SOURCE.read_text())
videos = list(bank.get('videos') or [])

# v2 is deliberately fail-closed. A discovery bucket, generic prose in a description,
# or the fact that a person happens to speak in a video is not enough.
# Production acceptance requires strong source-owned evidence that the primary recording
# itself is a public speech/address/remarks OR a public interview/Q&A/conversation.

HARD_REJECT_PATTERNS = [
    ('remote_zoom', r'\bzoom(?:\.us)?\b|\bzoom recording\b|\bzoom call\b|\bzoom meeting\b'),
    ('remote_teams', r'\bmicrosoft teams\b|\bteams meeting\b|\bteams call\b'),
    ('remote_webex', r'\bwebex\b|\bcisco webex\b'),
    ('remote_meet', r'\bgoogle meet\b|\bhangouts?\b|\bvideo call\b|\bconference call\b'),
    ('webinar', r'\bwebinar\b|\bonline seminar\b'),
    ('virtual_remote', r'\bvirtual (?:meeting|event|conference|conversation|interview|panel|forum|town hall)\b|\bremote (?:interview|conversation|meeting|session)\b'),
    ('screen_webcam', r'\bscreen recording\b|\bscreen capture\b|\bwebcam\b|\bvideo conference\b|\bteleconference\b'),
    ('phone_radio', r'\btelephone interview\b|\bphone interview\b|\bradio interview\b|\baudio[- ]only\b'),
    ('self_interview', r'\bauto[- ]?interview\b|\bself[- ]?interview\b'),
    ('podcast', r'\bpodcast\b|\bvodcast\b'),
    ('news_package', r'\bnews clip\b|\bnews package\b|\bnews report\b|\bnews coverage\b|\bnewscast\b|\bnewsreel\b'),
    ('broll_footage', r'\bb[- ]?roll\b|\braw footage\b|\bstock footage\b|\bfootage only\b|\barchive footage\b'),
    ('promo_ad', r'\bpromo(?:tional)?\b|\btrailer\b|\bcommercial\b|\badvertisement\b|\bteaser\b|\brecruit(?:ing|ment) (?:film|video|advertisement)\b'),
    ('non_speech_media', r'\bmusic video\b|\blyric video\b|\bgameplay\b|\banimation\b|\btime[- ]?lapse\b|\bslideshow\b'),
    ('documentary_training', r'\bdocumentary\b|\btraining film\b|\bpropaganda film\b'),
    ('tutorial_demo', r'\bscreen demo\b|\bsoftware demo\b|\bproduct demo\b|\btutorial\b|\bhow[- ]?to\b'),
    ('panel_roundtable', r'\bpanel discussion\b|\broundtable\b|\bpanel session\b'),
]
HARD_REJECT = [(name, re.compile(p, re.I)) for name, p in HARD_REJECT_PATTERNS]

# Strong title evidence. Title is trusted more than free-form description prose.
TITLE_SPEECH = [
    ('speech_title', re.compile(r'\b(?:public |campaign |rally |acceptance |award |inauguration |inaugural |commencement )?speech\b', re.I)),
    ('address_title', re.compile(r'\b(?:state of the state |state of the union |inaugural |farewell |commencement |presidential |national |public )?address\b', re.I)),
    ('remarks_title', re.compile(r'\bremarks\b', re.I)),
    ('keynote_title', re.compile(r'\bkeynote\b', re.I)),
    ('testimony_title', re.compile(r'\btestimony\b', re.I)),
    ('lecture_title', re.compile(r'\b(?:public |guest |distinguished )lecture\b', re.I)),
    ('statement_title', re.compile(r'\b(?:public |official |presidential )statement\b', re.I)),
    ('eulogy_title', re.compile(r'\beulogy\b', re.I)),
]
TITLE_INTERVIEW = [
    ('interview_title', re.compile(r'\binterview(?:ed)?\b', re.I)),
    ('qa_title', re.compile(r'\bq\s*&\s*a\b|\bquestions?\s+(?:and|&)\s+answers?\b|\bquestion[- ]and[- ]answer\b', re.I)),
    ('conversation_title', re.compile(r'\bin conversation with\b|\bconversation with\b|\bon[- ]stage conversation\b', re.I)),
    ('press_conference_title', re.compile(r'\bpress conference\b|\bnews conference\b', re.I)),
    ('press_briefing_title', re.compile(r'\bpress briefing\b|\bmedia briefing\b', re.I)),
    ('fireside_title', re.compile(r'\bfireside chat\b', re.I)),
]

# Description evidence must explicitly describe the recording, not merely contain a word
# such as "address" used as a verb or "interview" while discussing some other clip.
DESC_SPEECH = [
    ('speech_by', re.compile(r'\b(?:speech|address|remarks|keynote|testimony|lecture)\s+(?:by|from|of)\b', re.I)),
    ('delivered_speech', re.compile(r'\b(?:delivers?|delivered|gave|gives|giving|presents?|presented)\s+(?:(?:a|an|the|his|her|their)\s+)?(?:speech|address|remarks|keynote|testimony|lecture)\b', re.I)),
    ('spoke_at', re.compile(r'\b(?:speech|remarks|address)\s+(?:at|to)\s+(?:the\s+)?(?:audience|conference|ceremony|assembly|convention|rally|summit|forum)\b', re.I)),
]
DESC_INTERVIEW = [
    ('interview_with', re.compile(r'\b(?:an |the |this )?interview\s+(?:with|of|by)\b', re.I)),
    ('interviewed_by', re.compile(r'\binterviewed\s+by\b|\bwas interviewed\b|\bsits? down with\b', re.I)),
    ('qa_desc', re.compile(r'\bq\s*&\s*a\b|\bquestion[- ]and[- ]answer session\b|\bquestions from the audience\b', re.I)),
    ('conversation_desc', re.compile(r'\bin conversation with\b|\bon[- ]stage conversation with\b|\bpublic conversation with\b', re.I)),
    ('press_desc', re.compile(r'\b(?:press|news) conference\b|\bpress briefing\b|\bmedia briefing\b', re.I)),
    ('fireside_desc', re.compile(r'\bfireside chat\b', re.I)),
]

AMBIGUOUS_PATTERNS = [
    ('compilation', r'\bcompilation\b|\bmontage\b|\bbest of\b'),
    ('excerpt', r'\bexcerpt\b|\bclips? from\b|\bselected clips?\b|\bvideo clip from\b'),
    ('highlights', r'\bhighlights?\b'),
    ('edited_commentary', r'\bcommentary\b|\breaction\b|\banalysis\b|\bexplainer\b'),
    ('livestream_unclear', r'\blivestream\b|\blive stream\b'),
    ('generic_episode', r'\bepisode\s*#?\s*\d+\b|\bepisode\s+\d+\b'),
]
AMBIGUOUS = [(name, re.compile(p, re.I)) for name, p in AMBIGUOUS_PATTERNS]


def text(v, keys):
    values = []
    for k in keys:
        x = v.get(k)
        if isinstance(x, list):
            values.extend(str(y) for y in x if y)
        elif x:
            values.append(str(x))
    return ' '.join(values)


def classify(v):
    title = str(v.get('title') or '')
    desc = text(v, ['description', 'credit', 'artist', 'event', 'venue', 'series'])
    all_text = title + ' ' + desc + ' ' + str(v.get('pageUrl') or '')

    reject_hits = [name for name, rx in HARD_REJECT if rx.search(all_text)]
    if reject_hits:
        return {'status': 'reject', 'kind': None, 'reasons': reject_hits, 'evidence': 'hard-reject'}

    title_speech = [name for name, rx in TITLE_SPEECH if rx.search(title)]
    title_interview = [name for name, rx in TITLE_INTERVIEW if rx.search(title)]
    desc_speech = [name for name, rx in DESC_SPEECH if rx.search(desc)]
    desc_interview = [name for name, rx in DESC_INTERVIEW if rx.search(desc)]
    ambiguous = [name for name, rx in AMBIGUOUS if rx.search(all_text)]

    interview_hits = title_interview + desc_interview
    speech_hits = title_speech + desc_speech

    if ambiguous and (interview_hits or speech_hits):
        return {
            'status': 'review',
            'kind': 'public-interview' if interview_hits else 'public-speech',
            'reasons': ['ambiguous_primary_recording', *ambiguous, *interview_hits, *speech_hits],
            'evidence': 'ambiguous',
        }

    # Interviews win ties because a title can mention a speech being discussed inside an interview.
    if interview_hits:
        evidence = 'title' if title_interview else 'explicit-description'
        return {'status': 'accept', 'kind': 'public-interview', 'reasons': interview_hits, 'evidence': evidence}
    if speech_hits:
        evidence = 'title' if title_speech else 'explicit-description'
        return {'status': 'accept', 'kind': 'public-speech', 'reasons': speech_hits, 'evidence': evidence}

    bucket = str(v.get('discoveryBucket') or '')
    if bucket in {'celebrity-interviews', 'sports-stars', 'entertainment-talk', 'experts-public-figures', 'general-speech', 'interviews'}:
        return {
            'status': 'review', 'kind': None,
            'reasons': ['discovery_label_without_source_proof', bucket],
            'evidence': 'discovery-only',
        }
    return {
        'status': 'reject', 'kind': None,
        'reasons': ['no_strong_public_speech_or_interview_evidence'],
        'evidence': 'none',
    }

accepted, review, rejected = [], [], []
reason_counts = Counter()
kind_counts = Counter()
evidence_counts = Counter()

for v in videos:
    d = classify(v)
    base = {
        'referenceId': v.get('referenceId'),
        'title': v.get('title'),
        'pageUrl': v.get('pageUrl'),
        'sourceUrl': v.get('sourceUrl'),
        'discoveryBucket': v.get('discoveryBucket'),
        'auditStatus': d['status'],
        'sourceKind': d['kind'],
        'auditEvidence': d['evidence'],
        'auditReasons': d['reasons'],
    }
    for r in d['reasons']:
        reason_counts[r] += 1
    evidence_counts[d['evidence']] += 1

    if d['status'] == 'accept':
        e = dict(v)
        e.update({
            'auditStatus': 'accepted-production',
            'sourceKind': d['kind'],
            'auditEvidence': d['evidence'],
            'auditReasons': d['reasons'],
            'auditPolicyVersion': 'public-speech-interview-v2',
        })
        accepted.append(e)
        kind_counts[d['kind']] += 1
    elif d['status'] == 'review':
        review.append(base)
    else:
        rejected.append(base)

accepted.sort(key=lambda x: str(x.get('referenceId') or ''))
review.sort(key=lambda x: str(x.get('referenceId') or ''))
rejected.sort(key=lambda x: str(x.get('referenceId') or ''))

curated = {
    'version': 'public-speech-interview-bank-v2',
    'sourceBankVersion': bank.get('version'),
    'sourceBankCount': len(videos),
    'policy': {
        'failClosed': True,
        'allowed': ['public-speech', 'public-interview'],
        'positiveEvidence': 'title marker OR explicit recording-description phrase',
        'hardRejected': [name for name, _ in HARD_REJECT],
        'notes': [
            'Discovery buckets never count as proof.',
            'Generic description words such as address are not accepted unless they explicitly describe the recording.',
            'Zoom/Teams/Webex/Meet/webinars/remote calls/webcams/phone-radio interviews are hard rejected.',
            'Podcasts/news packages/B-roll/promos/documentaries/tutorials/panels are hard rejected.',
            'Compilations/excerpts/highlights/livestreams are review-only and excluded from production.',
        ],
    },
    'count': len(accepted),
    'videos': accepted,
}
CURATED.write_text(json.dumps(curated, indent=2, ensure_ascii=False))

hard_names = {name for name, _ in HARD_REJECT}
report = {
    'version': 'video-pool-audit-v2',
    'sourceBankVersion': bank.get('version'),
    'sourceBankCount': len(videos),
    'acceptedProductionCount': len(accepted),
    'publicSpeechCount': kind_counts['public-speech'],
    'publicInterviewCount': kind_counts['public-interview'],
    'reviewCount': len(review),
    'rejectedCount': len(rejected),
    'acceptedPercent': round(100 * len(accepted) / len(videos), 2) if videos else 0,
    'evidenceCounts': dict(evidence_counts),
    'topAuditReasons': dict(reason_counts.most_common(50)),
    'hardRejectReasonCounts': {name: reason_counts.get(name, 0) for name, _ in HARD_REJECT},
    'qualityGates': {
        'inputCountMatches10600': len(videos) == 10600,
        'countsReconcile': len(accepted) + len(review) + len(rejected) == len(videos),
        'acceptedHaveKind': all(v.get('sourceKind') in {'public-speech', 'public-interview'} for v in accepted),
        'acceptedHaveStrongEvidence': all(v.get('auditEvidence') in {'title', 'explicit-description'} for v in accepted),
        'acceptedHaveNoHardRejectReason': all(not any(r in hard_names for r in v.get('auditReasons', [])) for v in accepted),
    },
    'acceptedSample': [
        {
            'referenceId': v.get('referenceId'), 'title': v.get('title'),
            'sourceKind': v.get('sourceKind'), 'auditEvidence': v.get('auditEvidence'),
            'auditReasons': v.get('auditReasons'),
        } for v in accepted[:40]
    ],
    'reviewSample': review[:40],
    'rejectedSample': rejected[:40],
}
report['pass'] = all(report['qualityGates'].values())
REPORT.write_text(json.dumps(report, indent=2, ensure_ascii=False))
REVIEW.write_text(json.dumps({'version': 'video-pool-review-v2', 'count': len(review), 'videos': review}, indent=2, ensure_ascii=False))
REJECTED.write_text(json.dumps({'version': 'video-pool-rejected-sample-v2', 'count': len(rejected), 'videos': rejected[:750]}, indent=2, ensure_ascii=False))

print(json.dumps(report, indent=2, ensure_ascii=False))
if not report['pass']:
    raise SystemExit('Hearframe strict video-pool audit v2 failed')
