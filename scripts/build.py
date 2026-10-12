#!/usr/bin/env python3
"""Regenerate data.json from official YouTube channel RSS feeds. Stdlib only."""
import json, re, urllib.request, urllib.parse, xml.etree.ElementTree as ET, datetime, concurrent.futures as cf
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
 ("dota2","Dota 2","โดต้า 2",["UCTQKT5QqO3h7y32G8VzuySQ","UCfx0faaQeyIgPFz6axudwGQ"]),
 ("final-fantasy","Final Fantasy","ไฟนอลแฟนตาซี","UCH3sMKVJ2P7hm7ROBy5FHJg"),
 ("pokemon-go","Pokémon GO","โปเกมอน โก","UCA698bls2pjQyiqP9N-iaeg"),
 ("pokemon","Pokémon TCG & Pokémon News","การ์ดโปเกมอน & ข่าวโปเกมอน","UCFctpiB_Hnlk3ejWfHqSm6Q"),
 ("hype","Upcoming Hype Games","เกมที่รอคอย",["UC6VcWc1rAoWdBCM0JxrRQ3A","UCA5SLTAVA6unn1M-6lbo1NA"]),
 ("new-releases","New Releases & Trailers","เกมใหม่ & ตัวอย่าง",["UC-2Y8dQb0S6DtpxNgAKoJKA","UCjBp_7RuDBUYbd1LegWEJ8g","UCGIY_O-8vW4rfX98KlMkvRg","UCKy1dAqELo0zrOtPkf0eTMw","UCbu2SsF-Or3Rsn3NxqODImw"]),
]
MUSIC = [
 ("global","Global Trending","มาแรงทั่วโลก",["UCqECaJ8Gagnn7YCbPEzWH6g","UCPKWE1H6xhxwPlqUlKgHb_w","UC0WP5P-ufpRfjbNrmOWwLBQ","UC3lBXcrKFnFAFkfVk5WuKcQ","UCO5IQ70V7l-XpHW40HwaGsw","UCoUM-UJ7rirJYP8CQ0EIaHA","UCOmHUn--16B90oW2L6FRR3A","UCiGm_E4ZwYSHV3bcW1pnSeQ","UC9CoOnJkIBMdeijd9qYoT_g","UC9rMiEjNaCSsebs31MRDCRA","UCpFgmZm65yOU5X-hmWkWjuw"]),
 ("pop","Pop","ป๊อป",["UCqECaJ8Gagnn7YCbPEzWH6g","UCPKWE1H6xhxwPlqUlKgHb_w","UCiGm_E4ZwYSHV3bcW1pnSeQ","UC9CoOnJkIBMdeijd9qYoT_g","UCoUM-UJ7rirJYP8CQ0EIaHA"]),
 ("hiphop","Hip-Hop / Rap","ฮิปฮอป / แร็ป",["UC3lBXcrKFnFAFkfVk5WuKcQ","UCWY9g9jNYh6AS-E8-SKfBmA","UCfM3zsQsOnfWNUppiycmBuw","UCOjEHmBKwdS7joWpW0VrXkg","UCzpl23pGTHVYqvKsgY0A-_w","UCeLHszkByNZtPKcaVXOCOQQ"]),
 ("kpop","K-Pop","เคป๊อป",["UC3IZKseVpdzPSBaWxBxundA","UCEf_Bc-KVd7onSeifS3py9g","UCaO6TYtlC8U5ttz62hTrZgg","UCOmHUn--16B90oW2L6FRR3A","UCLkAepWjdylmXSltofFvsYQ","UC9rMiEjNaCSsebs31MRDCRA","UCMki_UkHb4qSc0qyEcOHHJw","UC9GtSLeksfK4yuJ_g1lgQbg","UCEpFoWeCMCo5z3EvWaz6hQQ","UCzgxx_DM2Dcb9Y1spb9mUJA"]),
 ("jpop","J-Pop","เจป๊อป",["UCvpredjG93ifbCP1Y77JyFA","UCpFgmZm65yOU5X-hmWkWjuw","UC3vg17IZ1IV73xx069jG44w","UCUCeZaZeJbEYAAzvMgrKOPQ","UCln9P4Qm3-EAY4aiEPmRwEA"]),
 ("thaipop","Thai Pop","เพลงไทย",["UCG9gfnA5UDoLvz-tC9B-HKw","UC_mceLIVkQun_Xcu1KBmfdw","UCrNFXmtWRFgbMHYJpjS3_0g","UC1T-ZwcYVQB6EpqOQD10tmw","UCs2t9DlvAuyTBkvk2djGZKw","UCEziz_UlMBt0e_pT-nWiRPw"]),
 ("edm","EDM / Dance","อีดีเอ็ม / แดนซ์",["UC1l7wYrva1qCH-wgqcHaaRg","UCIjYyZxkFucP_W-tmXg_9Ow","UC5H_KXkPbEsGs0tFt8R35mA"]),
 ("rock","Rock","ร็อก",["UCT9zcQNlyht7fRlcjmflRSA","UCZU9T1ceaOgwfLRq7OKFU4Q","UCi2KNss4Yx73NG0JARSFe0A"]),
 ("rnb","R&B","อาร์แอนด์บี",["UCO5IQ70V7l-XpHW40HwaGsw","UC0WP5P-ufpRfjbNrmOWwLBQ","UCuE1A4MDBt8YkgUkRAKMtjw","UCoUM-UJ7rirJYP8CQ0EIaHA"]),
 ("anime-music","Anime Music","เพลงอนิเมะ",["UC6pGDc4bFGD1_36IKv3FnYg","UCDb0peSmF5rLX7BvuTcJfCw","UC14QT5j2nQI8lKBCGtrrBQA"]),
 ("game-music","Game Music","เพลงเกม",["UCMx60HYcw1ieiPlZZagfqXQ"]),
]
JAPAN = [
 ("must-watch","Must-Watch Japan","ห้ามพลาด",["UULPHL9bfHTxCMi-7vfxQ-AYtg","UULPixD9UbKvDxzGNiPC_fgHyA","UULPDJ_LbyfNiutATmIIJ48HCQ","UULPnrVURWNd7VYjlQQ0UDpOQQ","UULPuJn_2HhHRqnu3xiIukNx1Q","UULPqwxJts-6yF33rupyF_DCsA","UULPm8xNi3kuBHE99QH-N_VJVg"]),
 ("food-adventures","Food Adventures","ตะลุยกินญี่ปุ่น",["UULPcAd5Np7fO8SeejB1FVKcYw","UULPyEd6QBSgat5kkC6svyjudA","UCcAd5Np7fO8SeejB1FVKcYw","UCyEd6QBSgat5kkC6svyjudA","UULPixD9UbKvDxzGNiPC_fgHyA","UULPDJ_LbyfNiutATmIIJ48HCQ","UULPHL9bfHTxCMi-7vfxQ-AYtg","UULPnrVURWNd7VYjlQQ0UDpOQQ","UULPqwxJts-6yF33rupyF_DCsA"],r"(?is)(?=.*\b(food|eat|eating|ramen|sushi|wagyu|beef|street food|restaurant|breakfast|lunch|dinner|seafood|fish market|izakaya|udon|bento|konbini|meals?|chef|crab|tuna|tasting)\b)(?=.*(japan|tokyo|osaka|kyoto|hokkaido|okinawa|japanese|fukuoka|kobe|sapporo|nagoya))"),
 ("4k-walks","4K Walks","เดินชมเมือง 4K",["UULPAcsAE1tpLuP3y7UhxUoWpQ","UCAcsAE1tpLuP3y7UhxUoWpQ","UULPoXm66ArnAYGC0SCItOb2Tg","UCoXm66ArnAYGC0SCItOb2Tg"]),
 ("hidden-towns","Hidden Towns","เมืองลับ",["UULPHL9bfHTxCMi-7vfxQ-AYtg","UULPuJn_2HhHRqnu3xiIukNx1Q","UULPqwxJts-6yF33rupyF_DCsA","UULPDJ_LbyfNiutATmIIJ48HCQ","UULPixD9UbKvDxzGNiPC_fgHyA","UULPnrVURWNd7VYjlQQ0UDpOQQ","UULPm8xNi3kuBHE99QH-N_VJVg","UCHL9bfHTxCMi-7vfxQ-AYtg","UCixD9UbKvDxzGNiPC_fgHyA","UCDJ_LbyfNiutATmIIJ48HCQ","UCnrVURWNd7VYjlQQ0UDpOQQ","UCqwxJts-6yF33rupyF_DCsA","UCm8xNi3kuBHE99QH-N_VJVg","UULPAcsAE1tpLuP3y7UhxUoWpQ","UCAcsAE1tpLuP3y7UhxUoWpQ","UULPoXm66ArnAYGC0SCItOb2Tg","UCoXm66ArnAYGC0SCItOb2Tg","UCfFrsS14viloVm1dKqHSoxQ","UCAF3bpYrvw_3RIkZ3OUnMNA"],r"(?i)\b(town|village|rural|countryside|inaka|island|hidden|remote|onsen|hot spring|deserted|ghost town|forgotten|middle of nowhere|least visited|ryokan|inn)\b"),
 ("wild-japan","Wild Japan / Nature","ธรรมชาติญี่ปุ่น",["UULPAcsAE1tpLuP3y7UhxUoWpQ","UULPHL9bfHTxCMi-7vfxQ-AYtg","UULPuJn_2HhHRqnu3xiIukNx1Q","UULPqwxJts-6yF33rupyF_DCsA","UULPDJ_LbyfNiutATmIIJ48HCQ","UULPixD9UbKvDxzGNiPC_fgHyA","UULPnrVURWNd7VYjlQQ0UDpOQQ","UULPoXm66ArnAYGC0SCItOb2Tg","UULPm8xNi3kuBHE99QH-N_VJVg","UCHL9bfHTxCMi-7vfxQ-AYtg","UCixD9UbKvDxzGNiPC_fgHyA","UCDJ_LbyfNiutATmIIJ48HCQ","UCnrVURWNd7VYjlQQ0UDpOQQ","UCqwxJts-6yF33rupyF_DCsA","UCm8xNi3kuBHE99QH-N_VJVg","UULPAcsAE1tpLuP3y7UhxUoWpQ","UCAcsAE1tpLuP3y7UhxUoWpQ","UULPoXm66ArnAYGC0SCItOb2Tg","UCoXm66ArnAYGC0SCItOb2Tg","UCfFrsS14viloVm1dKqHSoxQ","UCAF3bpYrvw_3RIkZ3OUnMNA"],r"(?i)\b(forest|mountains?|snow|fuji|nature|bears?|deer|monkeys?|volcano|hike|hiking|camping|beach|wild|wildlife|cherry blossoms?|sakura|autumn leaves|river|cave|waterfall|hot spring|onsen|island|aokigahara)\b"),
 ("hidden-gems","Hidden Gems","ที่เที่ยวลับ",["UCHL9bfHTxCMi-7vfxQ-AYtg","UCixD9UbKvDxzGNiPC_fgHyA","UCDJ_LbyfNiutATmIIJ48HCQ","UCAF3bpYrvw_3RIkZ3OUnMNA","UCfFrsS14viloVm1dKqHSoxQ","UCnrVURWNd7VYjlQQ0UDpOQQ"]),
 ("tips","Tips & Tricks","เคล็ดลับเที่ยวญี่ปุ่น",["UCfFrsS14viloVm1dKqHSoxQ"]),
 ("learn-japanese","Learn Japanese","เรียนภาษาญี่ปุ่น",["UC0ox9NuTHYeRys63yZpBFuA","UCdZHET-9_Comx6UaVTSETiQ"]),
 ("gaming-japan","Gaming in Japan","เกมในญี่ปุ่น",["UCkH3CcMfqww9RsZvPRPkAJA","UCyuEAZQzRqhcaLZvQd9ZUNA","UClFyIegrk4g6CFqGYCwTViA","UCHHnklRmgcQ-cBWtwrHZYuQ"]),
 ("pokemon-japan","Pokémon in Japan","โปเกมอนในญี่ปุ่น",["UC_SI1j1d8vJo_rYMV5o_dRg"]),
]
FLOOR_EXTRA={"global":2000000,"pop":300000,"hiphop":200000,"kpop":300000,"jpop":100000,"thaipop":10000,"edm":50000,"rock":50000,"rnb":200000,
 "anime-music":20000,"game-music":5000,"must-watch":1000000,"food-adventures":300000,"4k-walks":300000,"hidden-towns":300000,"wild-japan":300000,"hidden-gems":50000,"tips":0,"learn-japanese":1000,"gaming-japan":20000,"anime-spots":0,"pokemon-japan":10000}
# Minimum views per row (absolute floor). Rows keep at least MIN_KEEP videos: if too few pass, the next most-viewed fill in.
FLOOR={"premier-league":50000,"laliga":10000,"ucl":20000,"nba":10000,"f1":50000,"boxing":20000,"golf":50000,"ufc":5000,
 "atp":3000,"wta":3000,"apex":30000,"diablo":10000,"hype":100000,"dota2":10000,"final-fantasy":10000,"pokemon-go":30000,"pokemon":20000,"new-releases":100000}
FLOOR.update(FLOOR_EXTRA)
MIN_KEEP=10; MAX_KEEP=20
NS={"a":"http://www.w3.org/2005/Atom","yt":"http://www.youtube.com/xml/schemas/2015","m":"http://search.yahoo.com/mrss/"}
UA={"User-Agent":"Mozilla/5.0 sports-highlights"}
def get(url,t=20):
    with urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=t) as r: return r.status,r.read()
def embeddable(vid):
    try:
        s,_=get("https://www.youtube.com/oembed?format=json&url="+urllib.parse.quote(f"https://www.youtube.com/watch?v={vid}"),10); return s==200
    except Exception: return False
_C={}
def feed(cid):
    if cid not in _C: _C[cid]=_feed(cid)
    return _C[cid][0],[dict(v) for v in _C[cid][1]]
def _feed(cid):
    q=f"playlist_id={cid}" if cid.startswith(("UULP","UULF","PL")) else f"channel_id={cid}"
    _,body=get(f"https://www.youtube.com/feeds/videos.xml?{q}")
    root=ET.fromstring(body); ch=root.findtext("a:author/a:name",namespaces=NS) if cid.startswith(("UULP","UULF","PL")) else root.findtext("a:title",namespaces=NS); vids=[]
    for e in root.findall("a:entry",NS):
        vid=e.findtext("yt:videoId",namespaces=NS); link=e.find("a:link",NS).get("href","")
        vids.append({"id":vid,"title":e.findtext("a:title",namespaces=NS),"published":e.findtext("a:published",namespaces=NS),
          "channel":ch,"views":int((e.find("m:group/m:community/m:statistics",NS).get("views") if e.find("m:group/m:community/m:statistics",NS) is not None else 0) or 0),"short":"/shorts/" in link,"thumb":f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg"})
    return ch,vids
def row(r):
    key,name,th,cids=r[:4]; kw=r[4] if len(r)>4 else None
    if isinstance(cids,str): cids=[cids]
    vids=[];chans=[];skipped=[]
    for cid in cids:
        try: ch,v=feed(cid); chans.append(ch); vids+=v
        except Exception as e: skipped.append({"channelId":cid,"error":str(e)})
    if kw: vids=[v for v in vids if re.search(kw,v["title"] or "")]
    seen=set();vids=[v for v in vids if not (v["id"] in seen or seen.add(v["id"]))]
    vids.sort(key=lambda v:v["published"],reverse=True)
    with cf.ThreadPoolExecutor(8) as ex: ok=list(ex.map(lambda v:embeddable(v["id"]),vids))
    vids=[v for v,o in zip(vids,ok) if o]
    vids.sort(key=lambda v:v["views"],reverse=True)
    floor=FLOOR.get(key,0); keep=[v for v in vids if v["views"]>=floor]
    if len(keep)<MIN_KEEP: keep=vids[:MIN_KEEP]
    vids=keep[:MAX_KEEP]
    return {"key":key,"name":name,"th":th,"channels":chans,"minViews":FLOOR.get(key,0),"videos":vids,"skippedChannels":skipped}
rows=[dict(row(r),section="sports") for r in ROWS]+[dict(row(r),section="gaming") for r in GAMING]+[dict(row(r),section="music") for r in MUSIC]+[dict(row(r),section="japan") for r in JAPAN]
out={"updated":datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
     "rows":[r for r in rows if r.get("videos")],"skipped":[r for r in rows if not r.get("videos")]}
json.dump(out,open("data.json","w"),ensure_ascii=False,indent=1)
for r in out["rows"]: print(r["name"],len(r["videos"]))
print("skipped",out["skipped"])
