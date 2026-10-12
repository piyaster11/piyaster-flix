#!/usr/bin/env python3
"""Regenerate data.json from official YouTube channel RSS feeds. Stdlib only."""
import json, urllib.request, urllib.parse, xml.etree.ElementTree as ET, datetime, concurrent.futures as cf
ROWS = [
 ("premier-league","Premier League","พรีเมียร์ลีก","UCG5qGWdu8nIRZqJ_GgDwQ-w"),
 ("laliga","LaLiga","ลาลีกา","UCTv-XvfzLX3i4IGWAm4sbmA"),
 ("ucl","UEFA / Champions League","ยูฟ่า แชมเปียนส์ลีก","UCyGa1YEx9ST66rYrJTGIKOw"),
 ("nba","NBA","บาสเกตบอล NBA","UCWJ2lWNubArHWmf3FIHbfcQ"),
 ("f1","Formula 1","ฟอร์มูลาวัน","UCB_qr75-ydFVKSF9Dmo6izg"),
 ("boxing","Boxing","มวยสากล",["UCbzRzJNHx7ZLlJML9BjZQVQ","UC7LReVje9aPB4B6XAsXX8WQ","UCurvRE5fGcdUgCYWgh-BDsg","UCP3MOjimNiqqkhBcuXzO0RA"]),
 ("golf","Golf","กอล์ฟ",["UCKwGZZMrhNYKzucCtTPY2Nw","UCvZwbZt6YZQ4wj_7qyjPDZw","UCWZbPo5_riXyCFDyaMl2yRA","UCSZxaHGo1OEs06vQumIooug"]),
 ("ufc","UFC","ยูเอฟซี","UCvgfXK4nTYKudb0rFR6noLA"),
 ("atp","Tennis – ATP Tour","เทนนิสชาย","UCY_5h5zaSwN7Or4kIJDYNXA"),
 ("wta","Tennis – WTA","เทนนิสหญิง","UCaBIVVpHjq6j3tSyxwTE-8Q"),
]
GAMING = [
 ("apex","Apex Legends","เอเพ็กซ์ เลเจนด์ส","UC0ZV6M2THA81QT9hrVWJG3A"),
 ("diablo","Diablo","ดิอาโบล","UCxn8csYeZg6awRnZS-aqg0g"),
 ("hype","Upcoming Hype Games","เกมที่รอคอย",["UC6VcWc1rAoWdBCM0JxrRQ3A","UCH3sMKVJ2P7hm7ROBy5FHJg","UCA5SLTAVA6unn1M-6lbo1NA"]),
 ("new-releases","New Releases & Trailers","เกมใหม่ & ตัวอย่าง",["UC-2Y8dQb0S6DtpxNgAKoJKA","UCjBp_7RuDBUYbd1LegWEJ8g","UCGIY_O-8vW4rfX98KlMkvRg","UCKy1dAqELo0zrOtPkf0eTMw","UCbu2SsF-Or3Rsn3NxqODImw"]),
]
# Minimum views per row (absolute floor). Rows keep at least MIN_KEEP videos: if too few pass, the next most-viewed fill in.
FLOOR={"premier-league":50000,"laliga":10000,"ucl":20000,"nba":10000,"f1":50000,"boxing":20000,"golf":50000,"ufc":5000,
 "atp":3000,"wta":3000,"apex":30000,"diablo":10000,"hype":100000,"new-releases":100000}
MIN_KEEP=10; MAX_KEEP=20
NS={"a":"http://www.w3.org/2005/Atom","yt":"http://www.youtube.com/xml/schemas/2015","m":"http://search.yahoo.com/mrss/"}
UA={"User-Agent":"Mozilla/5.0 sports-highlights"}
def get(url,t=20):
    with urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=t) as r: return r.status,r.read()
def embeddable(vid):
    try:
        s,_=get("https://www.youtube.com/oembed?format=json&url="+urllib.parse.quote(f"https://www.youtube.com/watch?v={vid}"),10); return s==200
    except Exception: return False
def feed(cid):
    _,body=get(f"https://www.youtube.com/feeds/videos.xml?channel_id={cid}")
    root=ET.fromstring(body); ch=root.findtext("a:title",namespaces=NS); vids=[]
    for e in root.findall("a:entry",NS):
        vid=e.findtext("yt:videoId",namespaces=NS); link=e.find("a:link",NS).get("href","")
        vids.append({"id":vid,"title":e.findtext("a:title",namespaces=NS),"published":e.findtext("a:published",namespaces=NS),
          "channel":ch,"views":int((e.find("m:group/m:community/m:statistics",NS).get("views") if e.find("m:group/m:community/m:statistics",NS) is not None else 0) or 0),"short":"/shorts/" in link,"thumb":f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg"})
    return ch,vids
def row(r):
    key,name,th,cids=r
    if isinstance(cids,str): cids=[cids]
    vids=[];chans=[];skipped=[]
    for cid in cids:
        try: ch,v=feed(cid); chans.append(ch); vids+=v
        except Exception as e: skipped.append({"channelId":cid,"error":str(e)})
    vids.sort(key=lambda v:v["published"],reverse=True)
    with cf.ThreadPoolExecutor(8) as ex: ok=list(ex.map(lambda v:embeddable(v["id"]),vids))
    vids=[v for v,o in zip(vids,ok) if o]
    vids.sort(key=lambda v:v["views"],reverse=True)
    floor=FLOOR.get(key,0); keep=[v for v in vids if v["views"]>=floor]
    if len(keep)<MIN_KEEP: keep=vids[:MIN_KEEP]
    vids=keep[:MAX_KEEP]
    return {"key":key,"name":name,"th":th,"channels":chans,"minViews":FLOOR.get(key,0),"videos":vids,"skippedChannels":skipped}
rows=[dict(row(r),section="sports") for r in ROWS]+[dict(row(r),section="gaming") for r in GAMING]
out={"updated":datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
     "rows":[r for r in rows if r.get("videos")],"skipped":[r for r in rows if not r.get("videos")]}
json.dump(out,open("data.json","w"),ensure_ascii=False,indent=1)
for r in out["rows"]: print(r["name"],len(r["videos"]))
print("skipped",out["skipped"])
