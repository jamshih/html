from __future__ import annotations

from collections import Counter
from pathlib import Path
import json
import re

ROOT = Path('hearframe-grand-v4/ask')
SOURCE = ROOT / 'reference-bank-v3.json'
CURATED = ROOT / 'public-speech-interview-bank.json'
REPORT = ROOT / 'video-pool-audit-report.json'
REJECTED = ROOT / 'video-pool-audit-rejected-sample.json'
REVIEW = ROOT / 'video-pool-audit-review.json'

bank = json.loads(SOURCE.read_text())
videos = list(bank.get('videos') or [])

# Production rule: fail closed. Discovery buckets never prove that a source is usable.
# A video enters the production pool only when its own metadata strongly identifies it
# as a public speech/address/remarks OR a public interview/Q&A/conversation and none of
# the remote-call / generic-footage / news-package rejection signals are present.

HARD_REJECT_PATTERNS = [
    ('remote_zoom', r'\bzoom(?:\.us)?\b|\bzoom recording\b|\bzoom call\b|\bzoom meeting\b'),
    ('remote_teams', r'\bmicrosoft teams\b|\bteams meeting\b|\bteams call\b'),
    ('remote_webex', r'\bwebex\b|\bcisco webex\b'),
    ('remote_meet', r'\bgoogle meet\b|\bhangouts?\b|\bvideo call\b|\bconference call\b'),
    ('webinar', r'\bwebinar\b|\bvirtual webinar\b|\bonline seminar\b'),
    ('virtual_meeting', r'\bvirtual (?:meeting|event|conference|conversation|interview|panel|forum|town hall)\b|\bremote interview\b|\bremote conversation\b'),
    ('screen_webcam', r'\bscreen recording\b|\bscreen capture\b|\bwebcam\b|\bvideo conference\b|\bteleconference\b'),
    ('podcast', r'\bpodcast\b|\bvodcast\b'),
    ('news_package', r'\bnews clip\b|\bnews package\b|\bnews report\b|\bnews coverage\b|\bnewscast\b|\bnewsreel\b'),
    ('broll_footage', r'\bb[- ]?roll\b|\braw footage\b|\bstock footage\b|\bfootage only\b|\barchive footage\b'),
    ('promo_ad', r'\bpromo(?:tional)?\b|\btrailer\b|\bcommercial\b|\badvertisement\b|\bteaser\b'),
    ('non_speech_media', r'\bmusic video\b|\blyric video\b|\bgameplay\b|\banimation\b|\btime[- ]?lapse\b|\bslideshow\b'),
    ('tutorial_demo', r'\bscreen demo\b|\bsoftware demo\b|\bproduct demo\b|\btutorial\b|\bhow[- ]?to\b'),
]
HARD_REJECT = [(name, re.compile(pattern, re.I)) for name, pattern in HARD_REJECT_PATTERNS]

SPEECH_PATTERNS = [
    ('speech', r'\bspeech\b'),
    ('address', r'\b(?:public |national |presidential |state of the union |radio )?address\b'),
    ('remarks', r'\bremarks\b'),
    ('keynote', r'\bkeynote(?: address| speech)?\b'),
    ('commencement', r'\bcommencement(?: address| speech)?\b'),
    ('inaugural', r'\binaugural(?: address| speech)?\b|\binauguration speech\b'),
    ('farewell', r'\bfarewell address\b'),
    ('lecture', r'\bpublic lecture\b|\bguest lecture\b|\bdistinguished lecture\b'),
    ('testimony', r'\b(?:public |congressional |senate |house )?testimony\b'),
    ('statement', r'\bpublic statement\b|\bofficial statement\b'),
    ('rally', r'\brally speech\b|\bcampaign speech\b'),
    ('acceptance', r'\bacceptance speech\b|\baward speech\b'),
    ('eulogy', r'\beulogy\b'),
]
SPEECH = [(name, re.compile(pattern, re.I)) for name, pattern in SPEECH_PATTERNS]

INTERVIEW_PATTERNS = [
    ('interview', r'\binterview(?:ed)?\b|\binterview with\b'),
    ('qa', r'\bq\s*&\s*a\b|\bquestions?\s+(?:and|&)\s+answers?\b|\bquestion[- ]and[- ]answer\b'),
    ('conversation', r'\bin conversation with\b|\bconversation with\b|\bpublic conversation\b|\bon[- ]stage conversation\b'),
    ('press_conference', r'\bpress conference\b|\bnews conference\b'),
    ('press_briefing', r'\bpress briefing\b|\bmedia briefing\b'),
    ('fireside', r'\bfireside chat\b'),
    ('town_hall', r'\btown hall\b.*\b(?:q&a|questions|conversation)\b|\b(?:q&a|questions|conversation)\b.*\btown hall\b'),
]
INTERVIEW = [(name, re.compile(pattern, re.I)) for name, pattern in INTERVIEW_PATTERNS]

# Signals that a nominal interview/speech is a compilation, excerpt package, or otherwise
# not a clean primary recording. These go to review, never directly into production.
REVIEW_PATTERNS = [
    ('compilation', r'\bcompilation\b|\bmontage\b|\bhighlights?\b|\bbest of\b'),
    ('excerpt', r'\bexcerpt\b|\bclips? from\b|\bselected clips?\b'),
    ('edited_commentary', r'\bcommentary\b|\breaction\b|\banalysis\b|\bexplainer\b'),
    ('panel', r'\bpanel discussion\b|\broundtable\b'),
    ('livestream_unclear', r'\blivestream\b|\blive stream\b'),
]
REVIEW_SIG = [(name, re.compile(pattern, re.I)) for name, pattern in REVIEW_PATTERNS]


def meta_text(v: dict) -> str:
    fields = [
        v.get('title'), v.get('description'), v.get('credit'), v.get('artist'),
        v.get('sourceName'), v.get('event'), v.get('venue'), v.get('series'),
        v.get('pageUrl'),
    ]
    cats = v.get('categories')
    if isinstance(cats, list):
        fields.extend(cats)
    return ' '.join(str(x) for x in fields if x)


def classify(v: dict) -> dict:
    text = meta_text(v)
    title = str(v.get('title') or '')

    rejects = [name for name, rx in HARD_REJECT if rx.search(text)]
    if rejects:
        return {'status': 'reject', 'kind': None, 'reasons': rejects}

    speech_hits = [name for name, rx in SPEECH if rx.search(text)]
    interview_hits = [name for name, rx in INTERVIEW if rx.search(text)]
    review_hits = [name for name, rx in REVIEW_SIG if rx.search(text)]

    # Clean primary-source requirement: a positive type marker must come from the source's
    # own metadata, not only from discoveryBucket/speechPriority search labels.
    if review_hits and (speech_hits or interview_hits):
        return {
            'status': 'review',
            'kind': 'public-interview' if interview_hits else 'public-speech',
            'reasons': ['ambiguous_primary_recording', *review_hits, *speech_hits, *interview_hits],
        }

    # Prefer interview when both occur, e.g. "interview after keynote speech".
    if interview_hits:
        return {'status': 'accept', 'kind': 'public-interview', 'reasons': interview_hits}
    if speech_hits:
        return {'status': 'accept', 'kind': 'public-speech', 'reasons': speech_hits}

    # Some entries are intentionally interview/speech-targeted by discovery query but lack
    # proof in their own title/description. They must be reviewed rather than trusted.
    bucket = str(v.get('discoveryBucket') or '')
    if bucket in {'celebrity-interviews', 'sports-stars', 'entertainment-talk', 'experts-public-figures', 'general-speech'}:
        return {'status': 'review', 'kind': None, 'reasons': ['discovery_label_without_source_proof', bucket]}

    return {'status': 'reject', 'kind': None, 'reasons': ['no_public_speech_or_interview_evidence']}


audited = []
accepted = []
review = []
rejected = []
reason_counts = Counter()
kind_counts = Counter()

for v in videos:
    decision = classify(v)
    row = {
        'referenceId': v.get('referenceId'),
        'title': v.get('title'),
        'pageUrl': v.get('pageUrl'),
        'sourceUrl': v.get('sourceUrl'),
        'discoveryBucket': v.get('discoveryBucket'),
        'auditStatus': decision['status'],
        'sourceKind': decision['kind'],
        'auditReasons': decision['reasons'],
    }
    audited.append(row)
    for reason in decision['reasons']:
        reason_counts[reason] += 1

    if decision['status'] == 'accept':
        enriched = dict(v)
        enriched['auditStatus'] = 'accepted-production'
        enriched['sourceKind'] = decision['kind']
        enriched['auditReasons'] = decision['reasons']
        enriched['auditPolicyVersion'] = 'public-speech-interview-v1'
        accepted.append(enriched)
        kind_counts[decision['kind']] += 1
    elif decision['status'] == 'review':
        review.append(row)
    else:
        rejected.append(row)

# Stable ordering makes diffs auditable.
accepted.sort(key=lambda x: str(x.get('referenceId') or ''))
review.sort(key=lambda x: str(x.get('referenceId') or ''))
rejected.sort(key=lambda x: str(x.get('referenceId') or ''))

curated = {
    'version': 'public-speech-interview-bank-v1',
    'sourceBankVersion': bank.get('version'),
    'sourceBankCount': len(videos),
    'policy': {
        'failClosed': True,
        'allowed': ['public-speech', 'public-interview'],
        'hardRejected': [name for name, _ in HARD_REJECT],
        'notes': [
            'Discovery-query buckets are not accepted as proof.',
            'Zoom/Teams/Webex/Google Meet/webinars/remote calls are hard rejected.',
            'Podcasts, news packages, B-roll/footage, promos, trailers and generic non-speech media are hard rejected.',
            'Ambiguous compilations/excerpts/panels/livestreams require review and are excluded from production.',
        ],
    },
    'count': len(accepted),
    'videos': accepted,
}
CURATED.write_text(json.dumps(curated, indent=2, ensure_ascii=False))

report = {
    'version': 'video-pool-audit-v1',
    'sourceBankVersion': bank.get('version'),
    'sourceBankCount': len(videos),
    'acceptedProductionCount': len(accepted),
    'publicSpeechCount': kind_counts['public-speech'],
    'publicInterviewCount': kind_counts['public-interview'],
    'reviewCount': len(review),
    'rejectedCount': len(rejected),
    'acceptedPercent': round(100 * len(accepted) / len(videos), 2) if videos else 0,
    'topAuditReasons': dict(reason_counts.most_common(40)),
    'hardRejectReasonCounts': {
        name: reason_counts.get(name, 0) for name, _ in HARD_REJECT
    },
    'qualityGates': {
        'inputCountMatches10600': len(videos) == 10600,
        'countsReconcile': len(accepted) + len(review) + len(rejected) == len(videos),
        'acceptedHaveKind': all(v.get('sourceKind') in {'public-speech', 'public-interview'} for v in accepted),
        'acceptedHaveNoHardRejectReason': all(not any(r in {name for name, _ in HARD_REJECT} for r in v.get('auditReasons', [])) for v in accepted),
    },
    'acceptedSample': [
        {
            'referenceId': v.get('referenceId'), 'title': v.get('title'),
            'sourceKind': v.get('sourceKind'), 'auditReasons': v.get('auditReasons'),
        } for v in accepted[:30]
    ],
    'reviewSample': review[:30],
    'rejectedSample': rejected[:30],
}
report['pass'] = all(report['qualityGates'].values())
REPORT.write_text(json.dumps(report, indent=2, ensure_ascii=False))
REVIEW.write_text(json.dumps({'version': 'video-pool-review-v1', 'count': len(review), 'videos': review}, indent=2, ensure_ascii=False))
REJECTED.write_text(json.dumps({'version': 'video-pool-rejected-sample-v1', 'count': len(rejected), 'videos': rejected[:500]}, indent=2, ensure_ascii=False))

print(json.dumps(report, indent=2, ensure_ascii=False))
if not report['pass']:
    raise SystemExit('Hearframe video-pool audit quality gate failed')
