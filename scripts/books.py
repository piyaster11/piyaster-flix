import json,urllib.request,urllib.parse,concurrent.futures as cf,sys
sys.path.insert(0,'scripts'); from books_src import ROWS,NEW
def j(u):
    return json.load(urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"piyaster-flix (books)"}),timeout=30))
def head(u):
    try: return urllib.request.urlopen(urllib.request.Request(u,method="HEAD"),timeout=20).status==200
    except Exception: return False
ALIAS={"The Three-Body Problem":"三体","The Girl with the Dragon Tattoo":"Män som hatar kvinnor","The Plague":"La Peste"}
def look(t,a):
    return _look(t,a) or (_look(ALIAS[t],a) if t in ALIAS else None)
def _look(t,a):
    q=urllib.parse.urlencode({"title":t,"author":a.split('&')[0].strip(),"limit":15,"fields":"key,title,author_name,cover_i,ratings_average,ratings_count,first_publish_year"})
    try: d=j("https://openlibrary.org/search.json?"+q)["docs"]
    except Exception as e: return None
    n=lambda x:''.join(c for c in x.lower().replace("’","'") if c.isalnum())
    ex=[x for x in d if n(x["title"])==n(t)]
    if not ex: return None
    ex.sort(key=lambda x:(not x.get("cover_i"),-(x.get("ratings_count") or 0)))
    return ex[0]
def _unused(u):
    try: return urllib.request.urlopen(urllib.request.Request(u,method="HEAD"),timeout=20).status==200
    except Exception: return False
out={"rows":[],"skipped":[]}
for key,name,th,items in ROWS:
    with cf.ThreadPoolExecutor(6) as ex: res=list(ex.map(lambda b:look(b[0],b[1]),items))
    books=[]
    for (t,a,line),d in zip(items,res):
        if not d: out["skipped"].append(f"{t} (not found on Open Library)"); continue
        b={"title":t,"author":a,"line":line,"year":d.get("first_publish_year"),
           "url":"https://openlibrary.org"+d["key"],"goodreads":"https://www.goodreads.com/search?q="+urllib.parse.quote(t+" "+a)}
        if d.get("cover_i") and head(f"https://covers.openlibrary.org/b/id/{d['cover_i']}-M.jpg?default=false"): b["cover"]=f"https://covers.openlibrary.org/b/id/{d['cover_i']}-M.jpg"
        if d.get("ratings_count",0)>=20: b["rating"]=round(d["ratings_average"],1); b["ratingCount"]=d["ratings_count"]; b["ratingSource"]="Open Library"
        books.append(b)
    out["rows"].append({"key":key,"name":name,"th":th,"books":books})
nb=[]
for t,a,date,line,src,isbn in NEW:
    b={"title":t,"author":a,"line":line,"release":date,"url":src,"goodreads":"https://www.goodreads.com/search?q="+isbn}
    c=f"https://covers.openlibrary.org/b/isbn/{isbn}-M.jpg?default=false"
    if head(c): b["cover"]=c.replace("?default=false","")
    nb.append(b)
out["rows"].append({"key":"new-books","name":"New & Upcoming","th":"หนังสือใหม่","books":nb})
json.dump(out,open("books.json","w"),ensure_ascii=False,indent=1)
for r in out["rows"]: print(r["key"],len(r["books"]),sum('cover' in b for b in r["books"]),sum('rating' in b for b in r["books"]))
print(out["skipped"])
