"""Synthetic Chromium regression: virtual IndexedDB Classroom state and shared Sync.
All requests intercepted. No Pixel, no production traffic, no user data."""
import json
from pathlib import Path
from urllib.parse import urlsplit,parse_qs
from playwright.sync_api import sync_playwright
CORE=Path(__file__).resolve().parents[1]/"components"/"adrian-sync.js"
SCRIPT=CORE.read_text(encoding="utf-8")
KEY="classroom_b2_state_v3"
BASE="https://adrianxds-ads.github.io"
END="https://adrin.tail8fd071.ts.net/hub-sync"
def state(sessions,answers):
    return json.dumps(dict(version=3,level=sessions+1,sessions=sessions,
        classSessions=3,quickSessions=sessions-3,answers=answers,correct=answers-4,
        points=100,studySec=1000,items={},history=[],answerHistory=[],
        customItems=[],planHistory=[]),separators=(',',':'))
def scenario(browser,name,local,remote=None):
    context=browser.new_context(service_workers="block")
    posts=[];gets=[];errors=[]
    def route(r):
        req=r.request
        if req.url==BASE+"/test-classroom-sync":
            return r.fulfill(status=200,content_type="text/html",body="<html><body>Isolated sync test</body></html>")
        if req.url.startswith(END+"/changes?"):
            gets.append(int(parse_qs(urlsplit(req.url).query)["since"][0]))
            entries={} if remote is None else {KEY:dict(value=remote,deleted=False,revision=10,updatedAt=100)}
            return r.fulfill(status=200,content_type="application/json",body=json.dumps(dict(revision=10,entries=entries)))
        if req.url==END+"/sync":
            data=json.loads(req.post_data)
            posts.append(data)
            return r.fulfill(status=200,content_type="application/json",body=json.dumps(dict(revision=11,acceptedKeys=list(data["changes"]),accepted=len(data["changes"]))))
        return r.abort()
    context.route("**/*",route)
    page=context.new_page()
    page.on("pageerror",lambda e: errors.append(str(e)))
    page.goto(BASE+"/test-classroom-sync")
    page.evaluate("""(init)=>{
       const KEY='classroom_b2_state_v3',origGet=Storage.prototype.getItem,origSet=Storage.prototype.setItem;
       window.virtual=init;
       Storage.prototype.getItem=function(k){return this===localStorage&&k===KEY?window.virtual:origGet.call(this,k)};
       Storage.prototype.setItem=function(k,v){if(this===localStorage&&k===KEY){window.virtual=String(v);return}return origSet.call(this,k,v)};
       window.ClassroomProgress={getItem:()=>window.virtual,flush:async()=>{sessionStorage.setItem('qa_flush','yes')}};
       sessionStorage.setItem('adrian_sync_reloaded_revision_110','10');
    }""",local)
    page.add_script_tag(content=SCRIPT)
    page.wait_for_function("window.AdrianSync?.baselineChecked?.()===true",timeout=9000)
    page.wait_for_timeout(200)
    actual=page.evaluate("window.virtual")
    pending=page.evaluate("JSON.parse(localStorage.getItem('adrian_sync_meta_v1')).pending")
    if remote is None:
        assert actual==local,(name,"unexpected local overwrite")
        assert KEY in pending,(name,"virtual key not registered",pending)
        assert gets[0]==0
    elif json.loads(remote)["sessions"]<json.loads(local)["sessions"]:
        assert actual==local,(name,"older remote replaced live state")
        assert KEY in pending,(name,"more recent local state not queued")
    else:
        assert actual==remote,(name,"higher server snapshot was not recovered")
        assert page.evaluate("sessionStorage.getItem('qa_flush')")=='yes',(name,"IndexedDB flush not awaited")
    # Force the outbound queue to a fully mocked endpoint; no real network or wait.
    if KEY in pending:
        page.evaluate("AdrianSync.flush()")
        page.wait_for_function("JSON.parse(localStorage.getItem('adrian_sync_meta_v1')).pending?.classroom_b2_state_v3===undefined",timeout=9000)
        assert len(posts)>=1 and KEY in posts[0]["changes"],(name,posts)
        assert posts[0]["changes"][KEY]["value"]==local,(name,"bad upload content")
    assert not errors,(name,errors)
    print("PASS",name,"initial_reads",gets,"mock_posts",len(posts),"level",json.loads(actual)["level"],flush=True)
    context.close()
def qa_origin_isolated(browser):
    context=browser.new_context(service_workers="block")
    attempted=[]
    def route(r):
        attempted.append(r.request.url)
        if r.request.url=="http://127.0.0.1:9876/qa":
            return r.fulfill(status=200,content_type="text/html",body="<html><body>QA only</body></html>")
        return r.abort()
    context.route("**/*",route)
    page=context.new_page()
    page.goto("http://127.0.0.1:9876/qa")
    page.add_script_tag(content=SCRIPT)
    result=page.evaluate("""()=>{
        localStorage.setItem('classroom_b2_state_v3',JSON.stringify({version:3,sessions:999,answers:999}));
        return {mode:AdrianSync.mode,baseline:AdrianSync.baselineChecked(),metadata:localStorage.getItem('adrian_sync_meta_v1')};
    }""")
    assert result==dict(mode="isolated-preview",baseline=True,metadata=None),result
    page.evaluate("AdrianSync.pull();AdrianSync.flush()")
    assert attempted==["http://127.0.0.1:9876/qa"],attempted
    print("PASS localhost_qa_cannot_contact_official_sync",flush=True)
    context.close()
def actual_indexeddb_bridge(browser):
    storage=(CORE.parent.parent.parent/"adaptive-pizarras"/"classroom-progress-storage.js").read_text(encoding="utf-8")
    context=browser.new_context(service_workers="block")
    outgoing=[];errors=[]
    def route(r):
        u=r.request.url
        if u==BASE+"/real-classroom-bridge":
            return r.fulfill(status=200,content_type="text/html",body='<html><body><main class="app"></main></body></html>')
        if u.startswith(END+"/changes?"):
            return r.fulfill(status=200,content_type="application/json",body=json.dumps(dict(revision=7,entries={})))
        if u==END+"/sync":
            data=json.loads(r.request.post_data)
            outgoing.append(data)
            return r.fulfill(status=200,content_type="application/json",
                body=json.dumps(dict(revision=8,acceptedKeys=list(data["changes"]))))
        return r.abort()
    context.route("**/*",route)
    page=context.new_page()
    page.on("pageerror",lambda e: errors.append(str(e)))
    page.goto(BASE+"/real-classroom-bridge")
    seeded=state(19,492)
    page.evaluate("raw=>localStorage.setItem('classroom_b2_state_v3',raw)",seeded)
    page.add_script_tag(content=storage)
    page.evaluate("ClassroomProgressReady")
    assert page.evaluate("ClassroomProgress.getItem()") == seeded
    assert page.evaluate("Object.keys(localStorage).includes('classroom_b2_state_v3')") is False
    # Simulate an old offline attempt: timestamp exists, server still has no Classroom row.
    page.evaluate("localStorage.setItem('adrian_sync_meta_v1',JSON.stringify({revision:100,times:{classroom_b2_state_v3:1000},baseRevisions:{},deviceId:'synthetic'}))")
    page.add_script_tag(content=SCRIPT)
    page.wait_for_function("AdrianSync?.baselineChecked?.()===true",timeout=9000)
    pending=page.evaluate("JSON.parse(localStorage.getItem('adrian_sync_meta_v1')).pending")
    assert KEY in pending,pending
    page.evaluate("AdrianSync.flush()")
    page.wait_for_function("JSON.parse(localStorage.getItem('adrian_sync_meta_v1')).pending?.classroom_b2_state_v3===undefined",timeout=9000)
    page.evaluate("ClassroomProgress.flush()")
    snapshot=page.evaluate("""async()=>{
        const db=await new Promise((res,rej)=>{const q=indexedDB.open('adrian-classroom-progress-v1');q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)});
        const row=await new Promise((res,rej)=>{const q=db.transaction('states').objectStore('states').get('classroom_b2_state_v3');q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)});
        db.close();return row;
    }""")
    assert snapshot["raw"]==seeded and snapshot["revision"]>=1,snapshot
    assert outgoing and outgoing[0]["changes"][KEY]["value"]==seeded,outgoing
    assert not errors,errors
    print("PASS actual_classroom_indexeddb_bridge_official_key_only",flush=True)
    context.close()
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",headless=True)
    scenario(browser,"classroom_idb_key_absent_from_enumeration",state(19,492))
    scenario(browser,"older_remote_cannot_replace_local",state(20,510),state(19,492))
    scenario(browser,"newer_remote_recovered_durably",state(19,492),state(21,534))
    qa_origin_isolated(browser)
    actual_indexeddb_bridge(browser)
    browser.close()
print("CLASSROOM_VIRTUAL_SYNC_TESTS_ALL_PASS",flush=True)
