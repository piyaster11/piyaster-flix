import sys,json,hashlib,asyncio,os
sys.path.insert(0,'/tmp/ph');from data import C,P
from gtts import gTTS
from concurrent.futures import ThreadPoolExecutor
SAY={"私は〇〇です":"私は、田中です","LINEやってますか？":"ラインやってますか？","ATMはどこですか？":"エーティーエムはどこですか？","草":"くさ","右／左":"右、左","はい／いいえ":"はい、いいえ","じゃあね／またね":"じゃあね、またね","今日／明日／昨日":"今日、明日、昨日","午前／午後":"午前、午後","百／千／一万":"百、千、一万"}
out=[]
for i,(c,jp,ro,en,th,n) in enumerate(P):
  say=SAY.get(jp,jp); f="audio/ja/"+hashlib.md5(say.encode()).hexdigest()[:10]+".mp3"
  out.append(dict(id=i+1,cat=c,jp=jp,romaji=ro,en=en,th=th,note=n,say=say,audio=f))
def one(p):
  if os.path.exists(p['audio']) and os.path.getsize(p['audio'])>1000: return
  for t in range(3):
    try: gTTS(p['say'],lang='ja').save(p['audio']);return
    except Exception as e: print("retry",p['jp'],e)
with ThreadPoolExecutor(4) as ex: list(ex.map(one,out))
bad=[p['jp'] for p in out if not os.path.exists(p['audio']) or os.path.getsize(p['audio'])<1000]
print("missing",bad)
json.dump(dict(note="Everyday Japanese phrases by situation. Audio: Google Translate TTS via gTTS (lang=ja), Web Speech fallback.",categories=[dict(key=k,name=a,th=b) for k,a,b in C],phrases=out),open("phrases.json","w"),ensure_ascii=False,indent=1)
print(len(out))
